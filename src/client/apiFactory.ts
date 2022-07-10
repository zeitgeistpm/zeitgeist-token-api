import { injectable } from 'inversify';
import container from '../container';
import { ContainerTypes } from '../containertypes';
import { networks } from '../const';
import { IZeitgeistApi } from './baseApi';

export interface IApiFactory {
    getApiInstance(networkName?: string): IZeitgeistApi;
}

@injectable()
export class ApiFactory implements IApiFactory {
    public getApiInstance(networkName = 'zeitgeist'): IZeitgeistApi {
        try {
            return container.getNamed<IZeitgeistApi>(ContainerTypes.Api, networkName);
        } catch {
            // fallback to Zeitgeist if invalid network name provided
            console.warn(`IZeitgeistApi container for ${networkName} network not found. Falling back to Zeitgeist`);
            return container.getNamed<IZeitgeistApi>(ContainerTypes.Api, networks.zeitgeist.name);
        }
    }
}
