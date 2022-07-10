import axios from 'axios';
import { PalletBalancesAccountData } from '@polkadot/types/lookup';
import { formatBalance, BN, hexToBn, numberToHex, numberToU8a } from '@polkadot/util';
import { injectable, inject } from 'inversify';
import { IApiFactory } from '../client/apiFactory';
import { ContainerTypes } from '../containertypes';
import { TokenStats } from '../models/tokenStats';
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
            const totalSupply = await api.getTotalSupply();

            const balancesToExclude = await api.getBalances(addressesToExclude);
            const totalBalancesToExclude = this.getTotalBalanceToExclude(balancesToExclude);
            const getCirculationFromSubscan = await this.getCirculationFromSubscan();
            const circulatingSupply = hexToBn(numberToHex(getCirculationFromSubscan)).sub(totalBalancesToExclude);

            return new TokenStats(
                Math.floor(new Date().getTime() / 1000),
                this.formatBalance(totalSupply, chainDecimals),
                this.formatBalance(circulatingSupply, chainDecimals),
            );
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

    private async getCirculationFromSubscan(): Promise<number> {
        try {
            const url = networks.zeitgeist.subscanUrl + '/api/scan/token';
            const option = getSubscanOption();
            const body = {};
            const result = await axios.post(url, body, option);

            if (result.data) {
                const available_balance = result.data.data.detail.ZTG.available_balance;
                //return Number(available_balance);
                return new Promise((resolve, reject) => {
                    let ab: number = Number(available_balance);
                    resolve(ab);
                });
            } else {
                return 0;
            }
        } catch (e) {
            console.error(e);
            throw new Error('Something went wrong. Most likely there is an error fetching data from Subscan API.');
        }
    }
}
