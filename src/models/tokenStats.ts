export type PeriodType = '7 days' | '30 days' | '90 days' | '1 year';
export type Pair = { date: number; value: number };
export type DateRange = { start: Date; end: Date };

export class TokenStats {
    price: number;
    price_change: number;
    total_issuance: number;
    free_balance: number;
    available_balance: number;
    locked_balance: number;
    reserved_balance: number;
    bonded_locked_balance: number;
    democracy_locked_balance: number;
    vesting_balance: number;
    inflation?: string;
    circulation_balance?: number;
}

export interface Price {
    price: number;
    change: number;
}

export interface diffs {
    day: number;
    week: number;
    month: number;
    ever: number;
}
export interface user {
    total?: number;
    active: number;
    users: number;
    day: string;
}
export interface UsersWithDiffs {
    total: number;
    users: user[];
    diffs: { diffsForTotal: diffs; diffsForActive: diffs };
}

export interface tx {
    txCount: number;
    amount: number;
    day: string;
    totalTxsCount?: number;
    totalTxsAmount?: number;
}

export interface TransactionsWithoutLabel {
    txs: tx[];
    totalTxsCount: number;
    totalTxsAmount: number;
}
