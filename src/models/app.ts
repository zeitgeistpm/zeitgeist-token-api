export interface MarketsTags {
    metrics: { tag: string; count: number }[];
}
export interface Top {
    poolId: Number;
    Volume: Number;
    TransferTimes: number;
    New?: boolean;
}
