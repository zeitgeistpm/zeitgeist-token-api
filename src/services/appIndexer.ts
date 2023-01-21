import axios from 'axios';
import { inject, injectable } from 'inversify';
import { IApiFactory } from '../client/apiFactory';
import { ContainerTypes } from '../containertypes';
import SDK from '@zeitgeistpm/sdk';
import { networks } from '../const';
import { MarketsTags, Top } from '../models/app';
import { PeriodType } from '../models/tokenStats';

export interface IAPPIndexerService {
    getMarketCount(): Promise<number>;
    getActiveMarketCount(): Promise<number>;
    getTagLists(active: boolean): Promise<MarketsTags>;
    getTop(period: PeriodType): Promise<Top[]>;
}

@injectable()
/**
 * Fetches markets stats from external data source
 */
export class APPIndexerService implements IAPPIndexerService {
    constructor(@inject(ContainerTypes.ApiFactory) private _apiFactory: IApiFactory) {}

    public async getMarketCount(): Promise<number> {
        try {
            const sdk = await SDK.initialize(networks.zeitgeist.endpoints[0]);

            const result = await sdk.models.getMarketCount();
            return result;
        } catch (e) {
            console.error(e);
            return -1;
        }
    }

    public async getActiveMarketCount(): Promise<number> {
        try {
            const option = {
                method: 'POST',
                url: networks.zeitgeist.graphqlUrl,
                data: {
                    query: `query getActiveMarketCount {
                        markets(where: {status_eq: "Active"}) {
                          id
                        }
                      }
                      `,
                },
            };
            return axios(option).then((response) => {
                if (response.data !== undefined) {
                    return response.data.data.markets.length;
                }
                return -1;
            });
        } catch (e) {
            console.error(e);
            return -1;
        }
    }

    public async getTagLists(active: boolean): Promise<MarketsTags> {
        try {
            const tagsQuery = active
                ? `
                      query totalTagsQuery {
                          markets(where: { status_eq: "Active" }) {
                              tags
                          }
                      }
                  `
                : `
                      query totalTagsQuery {
                          markets {
                              tags
                          }
                      }
                  `;
            const option = {
                method: 'POST',
                url: networks.zeitgeist.graphqlUrl,
                data: {
                    query: tagsQuery,
                },
            };
            return axios(option)
                .then((response) => {
                    if (response.data !== undefined) {
                        return response.data.data.markets;
                    }
                    return -1;
                })
                .then((response) => {
                    let i = 0;
                    var tagsMaps = response.reduce((arr: any, curr: any) => {
                        if (curr.tags === null || curr.tags.length === 0) {
                            i++;
                        } else {
                            curr.tags.forEach((index: any) => {
                                if (!arr.has(index)) {
                                    arr.set(index, 1);
                                } else {
                                    arr.set(index, arr.get(index) + 1);
                                }
                            });
                        }

                        return arr;
                    }, new Map());
                    tagsMaps.set('Others', i);
                    return { metrics: Array.from(tagsMaps, ([tag, count]) => ({ tag, count })) };
                });
        } catch (e) {
            console.error(e);
            return {} as MarketsTags;
        }
    }

    public async getTop(period: PeriodType): Promise<Top[]> {
        try {
            const d = period.includes('year') ? 365 : Number(period.substring(0, period.indexOf(' ')));
            const result = await axios.post(networks.zeitgeist.graphqlUrl, {
                query: `query TimeBasedVolume($startTime: DateTime, $endTime: DateTime) {
      historicalPools(
        where: {
          volume_gt: "0"
          event_contains: "Swap"
          timestamp_gt: $startTime
          timestamp_lt: $endTime
        }
        orderBy: poolId_DESC
      ) {
        poolId
        dVolume
        timestamp
      }
    }`,
                variables: {
                    startTime: ((date, days) => {
                        var result = new Date(date);
                        result.setDate(result.getDate() - days);
                        return result;
                    })(new Date(), d),
                    endTime: new Date().toISOString(),
                },
            });

            const poolArr = result.data.data.historicalPools;

            const res = new Array<Top>();
            for (const [index, pool] of poolArr.entries()) {
                const poolId = pool.poolId;
                if (index == 0 || poolId !== poolArr[index - 1].poolId) {
                    res.push({
                        poolId: poolId,
                        Volume: Number(pool.dVolume),
                        TransferTimes: 1,
                        New: Boolean(await this.getNewOrNot(poolId, period)),
                    });
                } else {
                    const poolIndex = res.findIndex((v) => v.poolId === poolId);
                    res[poolIndex].TransferTimes++;
                    res[poolIndex].Volume = Number(res[poolIndex].Volume) + Number(pool.dVolume);
                }
            }

            return res;
        } catch (e) {
            console.error(e);
            return [] as Array<Top>;
        }
    }

    private async getNewOrNot(poolId: number, period: PeriodType) {
        const d = period.includes('year') ? 365 : Number(period.substring(0, period.indexOf(' ')));

        const result = await axios.post(networks.zeitgeist.graphqlUrl, {
            query: `query QueryTimestamp($poolId: Int) {
            historicalPools(where: {poolId_eq: $poolId}, orderBy: timestamp_ASC) {
              timestamp
            }
          }
          `,
            variables: {
                poolId: poolId,
            },
        });

        if (
            ((date, days) => {
                var result = new Date(date);
                result.setDate(result.getDate() - days);
                return result;
            })(new Date(), d) > new Date(result.data.data.historicalPools[0].timestamp)
        ) {
            return false;
        }
        return true;
    }
}
