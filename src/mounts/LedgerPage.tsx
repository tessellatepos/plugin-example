import type { PluginContext } from "@tessellatepos/plugin-sdk";
import { convertCentsToDollars } from "@tessellatepos/sdk";
import type { LedgerResponse } from "../loyalty.ts";
import { buttonStyle, cardStyle, headingStyle } from "../styles.ts";
import { usePluginApi } from "../usePluginApi.ts";

const cellStyle = {
    padding: "0.25rem 0.75rem 0.25rem 0",
    textAlign: "left",
} as const;

/**
 * Mount: PAGE — a full page owned by the plugin, at /plugins/loyalty-sidebar.
 * Lists rows from the plugin's own database table via its /ledger route.
 */
export function LedgerPage({ context }: { context: PluginContext }) {
    const ledger = usePluginApi<LedgerResponse>(context.api, "/ledger");

    return (
        <div style={{ ...cardStyle, maxWidth: "48rem", margin: "1.5rem auto" }}>
            <p style={{ ...headingStyle, fontSize: "1.125rem" }}>
                Loyalty ledger
            </p>
            {ledger.status === "loading" && <p>Loading…</p>}
            {ledger.status === "error" && <p>{ledger.message}</p>}
            {ledger.status === "ok" && ledger.data.entries.length === 0 && (
                <p>No points awarded yet. Complete a sale to see one here.</p>
            )}
            {ledger.status === "ok" && ledger.data.entries.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={cellStyle}>Order</th>
                            <th style={cellStyle}>Total</th>
                            <th style={cellStyle}>Points</th>
                            <th style={cellStyle}>Awarded</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ledger.data.entries.map((entry) => (
                            <tr key={entry.id}>
                                <td style={cellStyle}>{entry.order_id}</td>
                                <td style={cellStyle}>
                                    ${convertCentsToDollars(entry.amount_cents)}
                                </td>
                                <td style={cellStyle}>{entry.points}</td>
                                <td style={cellStyle}>
                                    {new Date(
                                        entry.created_at,
                                    ).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <button
                type="button"
                style={buttonStyle}
                onClick={() => context.navigate("/settings")}>
                Back to settings
            </button>
        </div>
    );
}
