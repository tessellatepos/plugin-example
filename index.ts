// Server entry for the loyalty-sidebar example plugin.
//
// Compiled to dist/index.js (`npm build`), which the package.json's `main` field
// points at. The backend scans its plugins/ directory at startup, validates
// each package.json as a manifest, then import()s `main` and calls the
// default export with a Plugin instance. Everything the plugin does
// server-side is declared here: database tables, API routes, hooks, and
// event listeners.
//
// The SDK packages are left out of the compiled file: the backend provides
// them, so imports resolve against its node_modules.
import { PluginApiMethod, PluginColumnType } from "@tessellatepos/plugin-sdk";
import {
    hooks,
    events,
    type ServerPlugin,
} from "@tessellatepos/plugin-sdk/server";
import {
    pointsForCents,
    type AwardResponse,
    type LedgerEntry,
    type LedgerResponse,
    type SummaryResponse,
} from "./src/loyalty.ts";

const PG_UNIQUE_VIOLATION = "23505";

export default function register(plugin: ServerPlugin) {
    // ── Database mount ──
    // The host creates each table at startup (CREATE TABLE IF NOT EXISTS) as
    // "<plugin name>-<table name>", here "loyalty-sidebar-ledger". Exactly
    // one primary key column is required. Handlers reach the table through
    // ctx.db.table("ledger"), never through a direct connection. Rows come back
    // untyped, so cast them to the row shape you declared.
    plugin.register("database", {
        tables: [
            {
                name: "ledger",
                columns: [
                    {
                        name: "id",
                        type: PluginColumnType.INTEGER,
                        primaryKey: true,
                        autoIncrement: true,
                    },
                    {
                        name: "order_id",
                        type: PluginColumnType.VARCHAR,
                        length: 64,
                        unique: true,
                    },
                    { name: "amount_cents", type: PluginColumnType.INTEGER },
                    { name: "points", type: PluginColumnType.INTEGER },
                    { name: "created_at", type: PluginColumnType.TIMESTAMP },
                ],
            },
        ],
    });

    // ── API mounts ──
    // Served at /plugins/loyalty-sidebar/<route>; the client calls them with
    // context.api.call(route, method). Routes use path-to-regexp syntax.
    // Handlers return { status?, body }. The body is sent as JSON, so
    // convert any bigint (e.g. Money.amount) to a number or string first.

    plugin.register("api", {
        route: "/ledger",
        method: PluginApiMethod.GET,
        handler: async (_req, ctx) => {
            const rows = (await ctx.db.table("ledger").find()) as LedgerEntry[];
            const entries = rows.sort((a, b) => b.id - a.id).slice(0, 50);
            return { body: { entries } satisfies LedgerResponse };
        },
    });

    plugin.register("api", {
        route: "/summary",
        method: PluginApiMethod.GET,
        handler: async (_req, ctx) => {
            const rows = (await ctx.db.table("ledger").find()) as LedgerEntry[];
            const points = rows.reduce((sum, row) => sum + row.points, 0);
            return {
                body: { orders: rows.length, points } satisfies SummaryResponse,
            };
        },
    });

    plugin.register("api", {
        route: "/orders/:orderId/award",
        method: PluginApiMethod.POST,
        handler: async (req, ctx) => {
            const { orderId } = req.params;
            const ledger = ctx.db.table("ledger");

            // Never trust amounts from the client: re-read the order from
            // the host's active provider.
            const order = await ctx.getOrder(orderId);
            if (!order) {
                return { status: 404, body: { error: "Order not found" } };
            }
            const paid =
                order.state === "COMPLETED" || (order.tenders?.length ?? 0) > 0;
            if (!paid) {
                return { status: 409, body: { error: "Order is not paid" } };
            }

            const amount = order.totalMoney?.amount ?? 0n;
            try {
                const entry = (await ledger.insert({
                    order_id: orderId,
                    amount_cents: Number(amount),
                    points: pointsForCents(amount),
                    created_at: new Date(),
                })) as LedgerEntry;
                return {
                    status: 201,
                    body: {
                        entry,
                        alreadyAwarded: false,
                    } satisfies AwardResponse,
                };
            } catch (err) {
                // order_id is unique, so a repeat call lands here. Return
                // the existing row so the route is safe to call twice.
                if ((err as { code?: string }).code !== PG_UNIQUE_VIOLATION)
                    throw err;
                const [entry] = (await ledger.find({
                    order_id: orderId,
                })) as LedgerEntry[];
                return {
                    body: {
                        entry,
                        alreadyAwarded: true,
                    } satisfies AwardResponse,
                };
            }
        },
    });

    // ── Hooks ──
    // Hooks run before an action and can change or block it. They form a
    // waterfall across all plugins: return { ok: true, value } to pass a
    // (possibly modified) value on, or { ok: false, reason } to stop the
    // action. The reason is returned to the frontend as a 400 error.
    plugin.hook(hooks.beforeOrderCreate, (order) => {
        if (!order.lineItems?.length) {
            return { ok: false, reason: "Cannot create an empty order" };
        }
        return { ok: true, value: order };
    });

    // ── Events ──
    // Events fire after the fact. Listeners can't change the outcome, aren't
    // awaited, and their errors are logged without affecting the request.
    plugin.on(events.paymentCompleted, (order, method) => {
        console.log(
            `[loyalty-sidebar] ${method} payment completed for order ${order.id}`,
        );
    });
}
