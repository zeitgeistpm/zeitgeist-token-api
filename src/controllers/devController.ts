import express, { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { ContainerTypes } from '../containertypes';
import { IDevIndexerService, PeriodType } from '../services/devIndexer';
import { IControllerBase } from './iControllerBase';

@injectable()
export class DevController implements IControllerBase {
    constructor(@inject(ContainerTypes.DevIndexerService) private _indexerService: IDevIndexerService) {}

    public register(app: express.Application): void {
        /**
         * @description Transactions route v1.
         */
        app.route('/api/v1/dev/npm-downloads/:name/:period').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Query the numbers of total markets'
            */
            res.json(
                await this._indexerService.getNpmDownloads(req.params.name as string, req.params.period as PeriodType),
            );
        });

        /**
         * @description Transactions route v1.
         */
        app.route('/api/v1/dev/github-metrics/:organization/:name').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Query the numbers of total markets'
            */
            res.json(
                await this._indexerService.getGithubStats(req.params.organization as string, req.params.name as string),
            );
        });
    }
}
