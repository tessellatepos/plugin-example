import { PluginApiMethod, type PluginContext } from "@tessellatepos/plugin-sdk";
import type { AwardResponse } from "../loyalty.ts";
import { cardStyle, headingStyle } from "../styles.ts";
import { usePluginApi } from "../usePluginApi.ts";

/**
 * Mount: RECEIPT_EXTRA — calling the plugin's own backend route.
 *
 * Only the order id is sent. The server re-reads the order from the host
 * (ctx.getOrder) and works out the points itself, so the client can't
 * inflate them. The route is idempotent, which also covers React StrictMode
 * running this effect twice in development.
 */
export function ReceiptPoints({ context }: { context: PluginContext }) {
    const orderId = context.order.completedOrder?.id;
    const award = usePluginApi<AwardResponse>(
        context.api,
        orderId ? `/orders/${encodeURIComponent(orderId)}/award` : null,
        PluginApiMethod.POST,
    );

    if (!orderId) return null;

    return (
        <div
            style={cardStyle}
            data-plugin="loyalty-sidebar">
            <p style={headingStyle}>Loyalty</p>
            {award.status === "loading" && <p>Awarding points…</p>}
            {award.status === "error" && (
                <p>Couldn't award points: {award.message}</p>
            )}
            {award.status === "ok" && (
                <p>
                    {award.data.alreadyAwarded ? "Already awarded" : "Awarded"}{" "}
                    {award.data.entry.points} points for this order.
                </p>
            )}
        </div>
    );
}
