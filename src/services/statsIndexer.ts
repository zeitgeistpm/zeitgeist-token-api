import axios from 'axios';
import { inject, injectable } from 'inversify';
import { IApiFactory } from '../client/apiFactory';
import { ContainerTypes } from '../containertypes';
import { networks } from '../const';
import { getDateYyyyMmDd, getSubscanOption } from '../utils';

export type PeriodType = '7 days' | '30 days' | '90 days' | '1 year';
export type Pair = { date: number; value: number };
export type DateRange = { start: Date; end: Date };

export interface IStatsIndexerService {
    getValidTransactions(period: PeriodType): Promise<Pair[]>;

    getTotalTransfers(): Promise<number>;

    getPrice(period: PeriodType): Promise<Pair[]>;

    getHolders(): Promise<number>;

    getDecimal(): Promise<number>;
}

const DEFAULT_RANGE_LENGTH_DAYS = 7;

@injectable()
/**
 * Fetches statistics from external data source
 */
export class StatsIndexerService implements IStatsIndexerService {
    constructor(@inject(ContainerTypes.ApiFactory) private _apiFactory: IApiFactory) {}

    // we can support multi networks if we need
    public async getValidTransactions(period: PeriodType): Promise<Pair[]> {
        // Docs: https://support.subscan.io/#daily
        const url = networks.zeitgeist.subscanUrl + '/api/scan/daily';
        const range = this.getDateRange(period);
        const option = getSubscanOption();

        try {
            const result = await axios.post(
                url,
                {
                    start: getDateYyyyMmDd(range.start),
                    end: getDateYyyyMmDd(range.end),
                    format: 'day',
                    category: 'transfer',
                },
                option,
            );

            return result.data.data.list.map((node: { time_utc: string; total: number }) => {
                return [Date.parse(node.time_utc), node.total];
            });
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    public async getTotalTransfers(): Promise<number> {
        // Docs: https://support.subscan.io/#transfers
        const url = networks.zeitgeist.subscanUrl + '/api/scan/transfers';
        const option = getSubscanOption();

        try {
            const result = await axios.post(
                url,
                {
                    row: 1,
                    page: 1,
                },
                option,
            );
            return result.data.data.count;
        } catch (e) {
            console.error(e);
            throw new Error(
                'Unable to fetch number of total transfers. Most likely there is an error fetching data from Subscan API.',
            );
        }
    }

    public async getPrice(period: PeriodType): Promise<Pair[]> {
        const numberOfDays = this.getPeriodDurationInDays(period);

        try {
            const interval = period === '1 year' ? 'daily' : 'hourly';
            const result = await axios.get(
                `https://api.coingecko.com/api/v3/coins/zeitgeist/market_chart?vs_currency=usd&days=${numberOfDays}&interval=${interval}`,
            );
            return result.data.prices;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    public getDateRange(period: PeriodType): DateRange {
        const end = new Date();
        const numberOfDays = this.getPeriodDurationInDays(period);

        const start = new Date();
        start.setDate(start.getDate() - numberOfDays);

        return {
            start,
            end,
        };
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

    public async getHolders(): Promise<number> {
        try {
            const url = networks.zeitgeist.subscanUrl + '/api/scan/metadata';
            const option = getSubscanOption();
            const body = {};
            const result = await axios.post(url, body, option);

            if (result.data) {
                const holders = result.data.data.count_account;
                return Number(holders);
            } else {
                return 0;
            }
        } catch (e) {
            console.error(e);
            throw new Error('Something went wrong. Most likely there is an error fetching data from Subscan API.');
        }
    }

    public async getDecimal(): Promise<number> {
        try {
            const api = this._apiFactory.getApiInstance();
            const decimal = await api.getChainDecimals();
            return decimal;
        } catch (e) {
            console.error(e);
            throw new Error('Something went wrong. Most likely there is an error fetching data from Subscan API.');
        }
    }
}
