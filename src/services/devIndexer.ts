import axios from 'axios';
import { inject, injectable } from 'inversify';
import { IApiFactory } from '../client/apiFactory';
import { ContainerTypes } from '../containertypes';
import { GithubRepo } from '../models/devStats';

export type PeriodType = 'last-day' | 'last-week' | 'last-month';

export interface IDevIndexerService {
    getNpmDownloads(name: string, period: PeriodType): Promise<number>;
    getGithubStats(organization: string, name: string): Promise<GithubRepo>;
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

    public async getGithubStats(organization: string, name: string): Promise<GithubRepo> {
        try {
            const result = await axios.get(`https://api.github.com/repos/${organization}/${name}`);
            const res: GithubRepo = {
                id: result.data.id,
                name: result.data.name,
                fullName: result.data.full_name,
                description: result.data.description,
                url: result.data.url,
                homepage: result.data.homepage,
                openIssuesCount: result.data.open_issues,
                starsCount: result.data.stargazers_count,
                forksCount: result.data.forks_count,
                subscribersCount: result.data.subscribers_count,
            };
            return res;
        } catch (e) {
            console.error(e);
            return {} as GithubRepo;
        }
    }
}
