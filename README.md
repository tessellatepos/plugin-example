# loyalty-sidebar: example Tessellate plugin

A reference plugin that uses every extension point the plugin SDK offers. It
runs a simple loyalty program: it previews points in the cart, awards them
once an order is paid, and keeps a ledger in its own database table.

Copy this directory to start a new plugin.

## Layout

```
package.json         Plugin manifest (name, main, engines.tessellate, permissions)
index.ts             Server entry, runs inside the backend: tables, API routes, hooks, events
src/client.tsx       Client entry: registers a React component per UI mount point
src/mounts/          One component per mount point (see the table below)
src/loyalty.ts       Points rule and API types, shared by the server and client
src/usePluginApi.ts  Hook for calling this plugin's own API routes
src/styles.ts        Inline styles for the components
dist/                Build output: index.js (server) and client.js (browser)
docker-compose.yml   Full stack (redis, postgres, backend, frontend) with this plugin mounted
```

## What each piece shows

| Where | Extension point | Example |
|---|---|---|
| `index.ts` | Database mount | `ledger` table, provisioned as `loyalty-sidebar-ledger` |
| `index.ts` | API mounts | `GET /ledger`, `GET /summary`, `POST /orders/:orderId/award` |
| `index.ts` | Hook `beforeOrderCreate` | Blocks orders with no line items (returns `{ ok: false, reason }`) |
| `index.ts` | Event `paymentCompleted` | Logs each completed payment |
| `LoyaltySidebar.tsx` | `CART_SIDEBAR` | Reads `context.cart.getTotal()` for a live points preview |
| `CheckoutFooter.tsx` | `CHECKOUT_FOOTER` | Reads `context.cart.getItems()` and `context.order.discounts` |
| `ReceiptPoints.tsx` | `RECEIPT_EXTRA` | POSTs to the plugin's own route to award points for `context.order.completedOrder` |
| `SettingsCard.tsx` | `SETTINGS_TAB` | Fetches `/summary`; `context.navigate()` opens the plugin page |
| `LedgerPage.tsx` | `PAGE` | Full page at `/plugins/loyalty-sidebar` listing ledger rows |

The award route only takes an order id. The server re-reads the order through
`ctx.getOrder()` and works out the points itself, so the client can't inflate
them. A unique `order_id` column makes repeat calls return the existing row.

## Run it

Prerequisite: run `npm install` from the repo
root. The build is configured by `tessellatePlugin()` from
`@tessellatepos/plugin-sdk/vite`; one `vite build` produces both
`dist/index.js` and `dist/client.js`.

```sh
cd plugin
npm build                  # writes dist/index.js + dist/client.js; needed before compose starts
docker compose up           # storefront http://localhost:5173, backend http://localhost:3000
```

The backend and frontend are the published images on `ghcr.io/tessellatepos`.

The stack uses the cash-only `local` provider, so no Square account is needed.
Its secrets are throwaway development defaults. Override them with
`BETTER_AUTH_SECRET` and `TOKEN_ENCRYPTION_KEY` in your environment.

**These are currently not needed as the full auth client is not implemented so 
you can leave them with the throwaway values for the time being**

The plugin is loaded into the backend container, not baked into the image:

Run `npm dev` to rebuild `dist/` on every save. After that:

- **Client changes:** reload the browser.
- **Server changes** (`index.ts`, `package.json`): run `docker compose restart backend`.

To install the plugin into a backend you run without Docker, copy
`package.json` and `dist/` into `backend/plugins/loyalty-sidebar/`.
The folder name must match the `name` in `package.json`.

Try the API directly:

```sh
curl localhost:3000/plugins/loyalty-sidebar/summary
curl localhost:3000/plugins/loyalty-sidebar/ledger
```

## How the host loads a plugin

1. At startup the backend scans `plugins/*/package.json`. A manifest needs
   `name`, `version`, `main`, `engines.tessellate`, and `tessellate.permissions`.
   A plugin with an invalid manifest is skipped.
2. It `import()`s `main` (`dist/index.js`) and calls its default export with a
   `Plugin`. The backend then provisions tables and registers routes under
   `/plugins/<name>/`.
3. The frontend asks `GET /api/v1/plugins-discovery`, `import()`s each plugin's
   `dist/client.js`, and calls its default export with a `FrontendPlugin`.
4. Each component is rendered at its mount point inside an error boundary,
   with a `PluginContext` built from the host's stores.

## Rules for plugin code

- **Import only from `@tessellatepos/plugin-sdk` and `@tessellatepos/sdk`.**
  Never import from the frontend or the backend.
- **React and the SDKs come from the host.** `tessellatePlugin()` doesn't
  bundle `react`, `react/jsx-runtime`, `@tessellatepos/sdk` or
  `@tessellatepos/plugin-sdk` into `client.js`; imports of them use the
  frontend's own copies at runtime. (A second copy of React would make every
  hook throw.) If the frontend runs an older SDK that lacks an export your
  plugin uses, the browser console warns which one is missing.
- **Style inline.** The host's Tailwind build only includes classes the host
  itself uses, so plugin class names may not exist.
- **Don't return bigints from API handlers.** Responses are sent as JSON,
  which can't encode `bigint`, so convert `Money.amount` to a number or
  string first.
