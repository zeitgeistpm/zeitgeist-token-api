import axios from 'axios';
import { inject, injectable } from 'inversify';
import { IApiFactory } from '../client/apiFactory';
import { ContainerTypes } from '../containertypes';
import SDK from '@zeitgeistpm/sdk/dist';
import { networks } from '../const';

export interface IMarketIndexerService {
    getMarketCount(): Promise<number>;
}

@injectable()
/**
 * Fetches markets stats from external data source
 */
export class MarketIndexerService implements IMarketIndexerService {
    constructor(@inject(ContainerTypes.ApiFactory) private _apiFactory: IApiFactory) {}

    public async getMarketCount(): Promise<number> {
        try {
            const sdk = await SDK.initialize(networks.zeitgeist.rpcUrl);

            const result = await sdk.models.getMarketCount();
            return result;
        } catch (e) {
            console.error(e);
            return -1;
        }
    }
}
