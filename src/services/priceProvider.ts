import axios from 'axios';
import { injectable } from 'inversify';
import { IPriceProvider } from './iPriceProvider';
import container from '../container';
import { ContainerTypes } from '../containertypes';
import { Pair, PeriodType, Price } from '../models/tokenStats';
import { DEFAULT_RANGE_LENGTH_DAYS } from '../const';

/**
 * Provides token price by using Coin Gecko API
 */
type CoinGeckoTokenInfo = { id: string; symbol: string; name: string };

@injectable()
export class CoinGeckoPriceProvider implements IPriceProvider {
    public static BaseUrl = 'https://api.coingecko.com/api/v3';
    private static tokens: CoinGeckoTokenInfo[];

    public async getUsdPrice(): Promise<Price> {
        const url = `${CoinGeckoPriceProvider.BaseUrl}/simple/price?ids=zeitgeist&vs_currencies=usd&include_24hr_change=true`;

        const result = await axios.get(url);

        if (result.data['zeitgeist']) {
            return {
                price: result.data.zeitgeist.usd,
                change: result.data.zeitgeist.usd_24h_change,
            };
        }

        return {} as Price;
    }

    public async getPrice(period: PeriodType): Promise<Pair[]> {
        const numberOfDays = this.getPeriodDurationInDays(period);

        try {
            const interval = period === '1 year' ? 'daily' : 'hourly';
            const result = await axios.get(
                `${CoinGeckoPriceProvider.BaseUrl}/coins/zeitgeist/market_chart?vs_currency=usd&days=${numberOfDays}&interval=${interval}`,
            );
            return result.data.prices;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    private async getTokenId(symbol: string): Promise<string | undefined> {
        if (!CoinGeckoPriceProvider.tokens) {
            // Cache received data since token list is a quite big.
            CoinGeckoPriceProvider.tokens = await this.getTokenList();
        }

        return CoinGeckoPriceProvider.tokens.find((x) => x.symbol.toLowerCase() === symbol.toLowerCase())?.id;
    }

    private async getTokenList(): Promise<CoinGeckoTokenInfo[]> {
        const url = `${CoinGeckoPriceProvider.BaseUrl}/coins/list`;
        const result = await axios.get<CoinGeckoTokenInfo[]>(url);

        return result.data;
    }

    private getPeriodDurationInDays(period: PeriodType): number {
        const parts = period.toString().split(' ');
        let numberOfDays: number;

        try {
            numberOfDays = Number(parts[0]) * (parts[1].startsWith('year') ? 365 : 1);
        } catch {
            numberOfDays = DEFAULT_RANGE_LENGTH_DAYS;
        }

        return numberOfDays;
    }
}

/**
 * Uses registered price providers to fetch token price.
 */
@injectable()
export class PriceProviderWithFailover implements IPriceProvider {
    /**
     * Fetches all registered price providers and tries to fetch data from a first one.
     * If call fails it moves to second price provider and so on.
     * @param tokenInfo Token information.
     * @returns Token price or 0 if unable to fetch price.
     */
    public async getUsdPrice(): Promise<Price> {
        const providers = container.getAll<IPriceProvider>(ContainerTypes.PriceProvider);

        for (const provider of providers) {
            try {
                return await provider.getUsdPrice();
            } catch (error) {
                // execution will move to next price provider
                console.log(error);
            }
        }

        return {} as Price;
    }

    public async getPrice(period: PeriodType): Promise<Pair[]> {
        const providers = container.getAll<IPriceProvider>(ContainerTypes.PriceProvider);

        for (const provider of providers) {
            try {
                return await provider.getPrice(period);
            } catch (error) {
                // execution will move to next price provider
                console.log(error);
            }
        }

        return [] as Pair[];
    }
}
