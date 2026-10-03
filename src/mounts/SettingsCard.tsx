import type { PluginContext } from "@tessellatepos/plugin-sdk";
import { PLUGIN_NAME, type SummaryResponse } from "../loyalty.ts";
import { buttonStyle, cardStyle, headingStyle } from "../styles.ts";
import { usePluginApi } from "../usePluginApi.ts";

/**
 * Mount: SETTINGS_TAB — fetching data and navigating.
 *
 * `context.navigate` goes through the host's router. Every plugin gets a
 * full-page route at /plugins/<name>, which renders its PAGE mount.
 */
export function SettingsCard({ context }: { context: PluginContext }) {
    const summary = usePluginApi<SummaryResponse>(context.api, "/summary");

    return (
        <div
            style={cardStyle}
            data-plugin="loyalty-sidebar">
            <p style={headingStyle}>Loyalty program</p>
            {summary.status === "loading" && <p>Loading…</p>}
            {summary.status === "error" && <p>{summary.message}</p>}
            {summary.status === "ok" && (
                <p>
                    {summary.data.points} points awarded across{" "}
                    {summary.data.orders} orders.
                </p>
            )}
            <button
                type="button"
                style={buttonStyle}
                onClick={() => context.navigate(`/plugins/${PLUGIN_NAME}`)}>
                View ledger
            </button>
        </div>
    );
}
