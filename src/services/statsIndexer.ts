import axios from 'axios';
import { inject, injectable } from 'inversify';
import { IApiFactory } from '../client/apiFactory';
import { ContainerTypes } from '../containertypes';
import { getDateYyyyMmDd, getDiffs, getSubscanOption } from '../utils';
import { DateRange, Pair, PeriodType, TransactionsWithoutLabel, tx, user, UsersWithDiffs } from '../models/tokenStats';
import { DEFAULT_RANGE_LENGTH_DAYS, networks } from '../const';

export interface IStatsIndexerService {
    getValidTransactions(period: PeriodType): Promise<Pair[]>;

    fetchAddressLists(start: string, end: string): Promise<UsersWithDiffs>;

    fetchTxLists(start: string, end: string): Promise<TransactionsWithoutLabel>;

    getTransactionCount(): Promise<number>;

    getHolders(): Promise<number>;

    getDecimal(): Promise<number>;
}

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

    public async fetchAddressLists(start: string, end: string): Promise<UsersWithDiffs> {
        // Docs: https://support.subscan.io/#daily
        const url = networks.zeitgeist.subscanUrl + '/api/scan/daily';
        const option = getSubscanOption();
        const user = new Array<user>();

        try {
            const active = await axios
                .post(
                    url,
                    {
                        start: start,
                        end: end,
                        format: 'day',
                        category: 'ActiveAccount',
                    },
                    option,
                )
                .then((response: any) => {
                    response.data.data.list.forEach((value: any) => {
                        user.push({
                            day: value.time_utc.slice(0, 10),
                            active: value.total,
                            users: 0,
                            total: 0,
                        });
                    });
                    return user;
                });

            const newAccount = await axios
                .post(
                    url,
                    {
                        start: start,
                        end: end,
                        format: 'day',
                        category: 'NewAccount',
                    },
                    option,
                )
                .then((response: any) => {
                    response.data.data.list.forEach((value: any, index: number) => {
                        active[index].users = value.total;
                        if (index == 0) {
                            active[index].total = value.total;
                        } else {
                            active[index].total = active[index - 1].total + value.total;
                        }
                    });
                    return active;
                })
                .then(function (data: user[]) {
                    const res: UsersWithDiffs = { total: 0 } as UsersWithDiffs;

                    res.diffs = getDiffs(data);
                    res.users = data;
                    res.total = data[data.length - 1].total!;
                    return res;
                })
                .then((res) => {
                    return res;
                });
            return newAccount;
        } catch (e) {
            console.error(e);
            return {} as UsersWithDiffs;
        }
    }

    public async fetchTxLists(start: string, end: string): Promise<TransactionsWithoutLabel> {
        // Docs: https://support.subscan.io/#daily
        const url = networks.zeitgeist.subscanUrl + '/api/scan/daily';
        const option = getSubscanOption();
        const transactions = new Array<tx>();

        try {
            return await axios
                .post(
                    url,
                    {
                        start: start,
                        end: end,
                        format: 'day',
                        category: 'transfer',
                    },
                    option,
                )
                .then((response: any) => {
                    response.data.data.list.forEach((value: any, index: number) => {
                        const totalTxsCount =
                            index == 0 ? value.total : transactions[index - 1].totalTxsCount + value.total;
                        const totalTxsAmount =
                            index == 0
                                ? Number(value.transfer_amount_total)
                                : transactions[index - 1].totalTxsAmount! + Number(value.transfer_amount_total);

                        transactions.push({
                            txCount: value.total,
                            day: value.time_utc.slice(0, 10),
                            amount: Number(value.transfer_amount_total),
                            totalTxsCount: totalTxsCount,
                            totalTxsAmount: totalTxsAmount,
                        });
                    });
                    return transactions;
                })
                .then((data: tx[]) => {
                    const res: TransactionsWithoutLabel = {} as TransactionsWithoutLabel;

                    res.totalTxsAmount = data[data.length - 1].totalTxsAmount!;
                    res.txs = data;
                    res.totalTxsCount = data[data.length - 1].totalTxsCount!;
                    return res;
                });
        } catch (e) {
            console.error(e);
            return {} as TransactionsWithoutLabel;
        }
    }

    public async getTransactionCount(): Promise<number> {
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
