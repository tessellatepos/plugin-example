import type { PluginContext } from "@tessellatepos/plugin-sdk";
import { pointsForCents } from "../loyalty.ts";
import { cardStyle } from "../styles.ts";

/**
 * Mount: CHECKOUT_FOOTER — cart line items and order discounts.
 *
 * `getItems()` returns the SDK's CartItem objects (quantities are bigint);
 * `context.order.discounts` is the discount list the host will apply.
 */
export function CheckoutFooter({ context }: { context: PluginContext }) {
    const items = context.cart.getItems();
    if (items.length === 0) return null;

    const units = items.reduce((sum, item) => sum + (item.quantity ?? 1n), 0n);
    const discounts = context.order.discounts.length;

    return (
        <div
            style={cardStyle}
            data-plugin="loyalty-sidebar">
            {units.toString()} item{units === 1n ? "" : "s"}
            {discounts > 0 &&
                ` · ${discounts} discount${discounts === 1 ? "" : "s"}`}{" "}
            · earns {pointsForCents(context.cart.getTotal())} points once paid
        </div>
    );
}
