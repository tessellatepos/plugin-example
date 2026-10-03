/** Must match `name` in package.json — the host routes by it. */
export const PLUGIN_NAME = "loyalty-sidebar";

/**
 * Shared by the server entry (index.ts), which awards points, and the client,
 * which only previews them before an order is paid.
 */
const POINTS_PER_DOLLAR = 1;

export function pointsForCents(cents: bigint): number {
    return Number(cents / 100n) * POINTS_PER_DOLLAR;
}

// Shapes of this plugin's ledger rows and API responses (see index.ts).

export type LedgerEntry = {
    id: number;
    order_id: string;
    amount_cents: number;
    points: number;
    created_at: string;
};

export interface LedgerResponse {
    entries: LedgerEntry[];
}

export interface SummaryResponse {
    orders: number;
    points: number;
}

export interface AwardResponse {
    entry: LedgerEntry;
    alreadyAwarded: boolean;
}
