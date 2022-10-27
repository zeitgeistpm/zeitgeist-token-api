import axios from 'axios';
import { inject, injectable } from 'inversify';
import { IApiFactory } from '../client/apiFactory';
import { ContainerTypes } from '../containertypes';
import { github_repo } from '../types/devStats';

export type PeriodType = 'last-day' | 'last-week' | 'last-month';

export interface IDevIndexerService {
    getNpmDownloads(name: string, period: PeriodType): Promise<number>;
    getGithubStats(organization: string, name: string): Promise<github_repo>;
}

@injectable()
/**
 * Fetches markets stats from external data source
 */
export class DevIndexerService implements IDevIndexerService {
    constructor(@inject(ContainerTypes.ApiFactory) private _apiFactory: IApiFactory) {}

    public async getNpmDownloads(name: string, period: PeriodType): Promise<number> {
        try {
            const result = await axios.get(`https://api.npmjs.org/downloads/point/${period}/${name}`);
            return result.data.downloads;
        } catch (e) {
            console.error(e);
            return -1;
        }
    }

    public async getGithubStats(organization: string, name: string): Promise<github_repo> {
        try {
            const result = await axios.get(`https://api.github.com/repos/${organization}/${name}`);
            const res: github_repo = {
                name: result.data.name,
                star: result.data.watchers_count,
                fork: result.data.forks_count,
            };
            return res;
        } catch (e) {
            console.error(e);
            return {};
        }
    }
}
