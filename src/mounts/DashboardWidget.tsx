import type { PluginContext } from "@tessellatepos/plugin-sdk";
import { type SummaryResponse } from "../loyalty.ts";
import { cardStyle, headingStyle } from "../styles.ts";
import { usePluginApi } from "../usePluginApi.ts";

/** Mount: DASHBOARD_WIDGET, a self-contained card on the dashboard. */
export function DashboardWidget({ context }: { context: PluginContext }) {
    const summary = usePluginApi<SummaryResponse>(context.api, "/summary");

    return (
        <div
            style={cardStyle}
            data-plugin="loyalty-dashboard">
            <p style={headingStyle}>Loyalty</p>
            {summary.status === "loading" && <p>Loading…</p>}
            {summary.status === "error" && <p>{summary.message}</p>}
            {summary.status === "ok" && (
                <p>
                    {summary.data.points} points awarded across{" "}
                    {summary.data.orders} orders.
                </p>
            )}
        </div>
    );
}
