import axios from 'axios';
import { injectable } from 'inversify';
import { IPriceProvider } from './iPriceProvider';
import container from '../container';
import { ContainerTypes } from '../containertypes';

/**
 * Provides token price by using Coin Gecko API
 */
type CoinGeckoTokenInfo = { id: string; symbol: string; name: string };

@injectable()
export class CoinGeckoPriceProvider implements IPriceProvider {
    public static BaseUrl = 'https://api.coingecko.com/api/v3';
    private static tokens: CoinGeckoTokenInfo[];

    public async getUsdPrice(): Promise<number> {
        const url = `${CoinGeckoPriceProvider.BaseUrl}/simple/price?ids=zeitgeist&vs_currencies=usd`;

        const result = await axios.get(url);

        if (result.data['zeitgeist']) {
            const price = result.data['zeitgeist'].usd;
            return Number(price);
        }

        return 0;
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
    public async getUsdPrice(): Promise<number> {
        const providers = container.getAll<IPriceProvider>(ContainerTypes.PriceProvider);

        for (const provider of providers) {
            try {
                return await provider.getUsdPrice();
            } catch (error) {
                // execution will move to next price provider
                console.log(error);
            }
        }

        return 0;
    }
}
