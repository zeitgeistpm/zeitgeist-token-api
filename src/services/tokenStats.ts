import axios from 'axios';
import { PalletBalancesAccountData } from '@polkadot/types/lookup';
import { formatBalance, BN, hexToBn, numberToHex, numberToU8a } from '@polkadot/util';
import { injectable, inject } from 'inversify';
import { IApiFactory } from '../client/apiFactory';
import { ContainerTypes } from '../containertypes';
import { Price, TokenStats } from '../models/tokenStats';
import { addressesToExclude } from '../const';
import { networks } from '../const';
import { getSubscanOption } from '../utils';

export interface IStatsService {
    getTokenStats(): Promise<TokenStats>;
}

@injectable()
/**
 * Token statistics calculation service.
 */
export class StatsService implements IStatsService {
    constructor(@inject(ContainerTypes.ApiFactory) private _apiFactory: IApiFactory) {}

    /**
     * Calculates token circulation supply by substracting sum of all token holder accounts
     * not in circulation from total token supply.
     * @returns Token statistics including total supply and circulating supply.
     */
    public async getTokenStats(): Promise<TokenStats> {
        try {
            const api = this._apiFactory.getApiInstance();
            const chainDecimals = await api.getChainDecimals();

            const balancesToExclude = await api.getBalances(addressesToExclude);
            const totalBalancesToExclude = this.getTotalBalanceToExclude(balancesToExclude);
            const getTokenInfosFromSubscan = await this.getTokenInfosFromSubscan();
            const circulatingSupply = this.formatBalance(
                hexToBn(numberToHex(getTokenInfosFromSubscan.available_balance)).sub(totalBalancesToExclude),
                chainDecimals,
            );
            const inflation =
                (
                    this.getInflation(
                        getTokenInfosFromSubscan.total_issuance - 100000000,
                        getTokenInfosFromSubscan.total_issuance,
                    ) * 100
                ).toFixed(2) + '%';
            const price = await this.getPrice();

            return {
                ...getTokenInfosFromSubscan,
                circulation_balance: circulatingSupply,
                inflation: inflation,
                price: price.price,
                price_change: price.change,
            } as TokenStats;
        } catch (e) {
            console.error(e);
            throw new Error('Unable to fetch token statistics from a node.');
        }
    }

    private getTotalBalanceToExclude(balances: PalletBalancesAccountData[]): BN {
        const sum = balances
            .map((balance) => {
                return balance.free.add(balance.reserved);
            })
            .reduce((partialSum, b) => partialSum.add(b), new BN(0));

        return sum;
    }

    private formatBalance(balance: BN, chainDecimals: number): number {
        const result = formatBalance(balance, { decimals: chainDecimals, withSi: false, forceUnit: '-' }).split('.')[0];

        return parseInt(result.replaceAll(',', ''));
    }

    private getInflation(diff: number, total: number): number {
        const day = (Date.now() - new Date('2022-01-13 10:39:06').getTime()) / (1000 * 60 * 60 * 24 * 365);
        return diff / day / total;
    }

    private async getTokenInfosFromSubscan(): Promise<TokenStats> {
        try {
            const url = networks.zeitgeist.subscanUrl + '/api/scan/token';
            const option = getSubscanOption();
            const body = {};
            const result = await axios.post(url, body, option);
            const token: TokenStats = {} as TokenStats;

            if (result.data) {
                const ztg = result.data.data.detail.ZTG;
                token.price = Number(ztg.price);
                token.price_change = Number(ztg.price_change);
                token.total_issuance = Number(ztg.total_issuance) / 10 ** 10;
                token.free_balance = Number(ztg.free_balance) / 10 ** 10;
                token.available_balance = Number(ztg.available_balance);
                token.locked_balance = Number(ztg.locked_balance) / 10 ** 10;
                token.reserved_balance = Number(ztg.reserved_balance) / 10 ** 10;
                token.bonded_locked_balance = Number(ztg.bonded_locked_balance) / 10 ** 10;
                token.democracy_locked_balance = Number(ztg.democracy_locked_balance) / 10 ** 10;
                token.vesting_balance = Number(ztg.vesting_balance) / 10 ** 10;
            }
            return token;
        } catch (e) {
            console.error(e);
            throw new Error('Something went wrong. Most likely there is an error fetching data from Subscan API.');
        }
    }

    private async getPrice(): Promise<Price> {
        try {
            const url =
                'https://api.coingecko.com/api/v3/simple/price?ids=zeitgeist&vs_currencies=usd&include_24hr_change=true';

            const result = await axios.get(url);
            return {
                price: result.data.zeitgeist.usd,
                change: result.data.zeitgeist.usd_24h_change,
            };
        } catch (e) {
            console.error(e);
            throw new Error('Something went wrong. Most likely there is an error fetching data from Subscan API.');
        }
    }
}
