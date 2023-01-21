import { Pair, PeriodType, Price } from '../models/tokenStats';

/**
 * Definition of provider for access token price.
 */
export interface IPriceProvider {
    /**
     * Gets current token price in USD.
     * @param tokenInfo Token information.
     */
    getUsdPrice(): Promise<Price>;

    getPrice(period: PeriodType): Promise<Pair[]>;
}
