import axios from 'axios';
import { inject, injectable } from 'inversify';
import { IApiFactory } from '../client/apiFactory';
import { ContainerTypes } from '../containertypes';
import SDK from '@zeitgeistpm/sdk';
import { networks } from '../const';
import { MarketsTags } from '../models/app';

export interface IAPPIndexerService {
    getMarketCount(): Promise<number>;
    getActiveMarketCount(): Promise<number>;
    getTagLists(active: boolean): Promise<MarketsTags>;
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
}
