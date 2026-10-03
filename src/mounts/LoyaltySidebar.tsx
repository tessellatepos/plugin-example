import type { PluginContext } from "@tessellatepos/plugin-sdk";
import { convertCentsToDollars } from "@tessellatepos/sdk";
import { pointsForCents } from "../loyalty.ts";
import { cardStyle, headingStyle } from "../styles.ts";

/**
 * Mount: CART_SIDEBAR — reading the cart.
 *
 * The host rebuilds `context` whenever its cart store changes, so a plain
 * read on render stays live as items are added or removed. No state or
 * effects needed.
 */
export function LoyaltySidebar({ context }: { context: PluginContext }) {
    const totalCents = context.cart.getTotal();
    if (totalCents === 0n) return null;

    return (
        <div
            style={cardStyle}
            data-plugin="loyalty-sidebar">
            <p style={headingStyle}>Loyalty points preview</p>
            <p>
                ~{pointsForCents(totalCents)} points on this order (subtotal $
                {convertCentsToDollars(totalCents)})
            </p>
        </div>
    );
}
