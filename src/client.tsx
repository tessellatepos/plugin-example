import {
    PluginUIMountPoint,
    type FrontendPlugin,
} from "@tessellatepos/plugin-sdk";
import { CheckoutFooter } from "./mounts/CheckoutFooter.tsx";
import { LedgerPage } from "./mounts/LedgerPage.tsx";
import { LoyaltySidebar } from "./mounts/LoyaltySidebar.tsx";
import { ReceiptPoints } from "./mounts/ReceiptPoints.tsx";
import { SettingsCard } from "./mounts/SettingsCard.tsx";

/**
 * Client entry. The frontend's PluginLoader import()s the built bundle
 * (dist/client.js) and calls this once with a FrontendPlugin. Each
 * `register("ui", …)` places a component at one of the host's mount points.
 * Every component receives `{ context }`: the cart, order, settings,
 * navigate, and this plugin's scoped API client.
 */
export default function register(plugin: FrontendPlugin) {
    plugin.register("ui", {
        mount: PluginUIMountPoint.CART_SIDEBAR,
        component: LoyaltySidebar,
    });
    plugin.register("ui", {
        mount: PluginUIMountPoint.CHECKOUT_FOOTER,
        component: CheckoutFooter,
    });
    plugin.register("ui", {
        mount: PluginUIMountPoint.RECEIPT_EXTRA,
        component: ReceiptPoints,
    });
    plugin.register("ui", {
        mount: PluginUIMountPoint.SETTINGS_TAB,
        component: SettingsCard,
    });
    plugin.register("ui", {
        mount: PluginUIMountPoint.PAGE,
        component: LedgerPage,
    });
}
