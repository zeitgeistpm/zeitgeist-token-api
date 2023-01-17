import express, { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { ContainerTypes } from '../containertypes';
import { IAPPIndexerService } from '../services/appIndexer';
import { IControllerBase } from './iControllerBase';

@injectable()
export class APPController implements IControllerBase {
    constructor(@inject(ContainerTypes.MarketIndexerService) private _indexerService: IAPPIndexerService) {}

    public register(app: express.Application): void {
        /**
         * @description Transactions route v1.
         */
        app.route('/api/v1/app/marketCount').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Query the numbers of total markets'
                #swagger.tags = ['APP']
            */
            res.json(await this._indexerService.getMarketCount());
        });

        app.route('/api/v1/app/activeMarketCount').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Query the numbers of active markets'
                #swagger.tags = ['APP']
            */
            res.json(await this._indexerService.getActiveMarketCount());
        });

        app.route('/api/v1/app/getTagLists/:active').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Query the tag numbers of (active) markets'
                #swagger.tags = ['APP']
                #swagger.parameters['active'] = {
                    in: 'path',
                    type: 'boolean',
                    description: 'The boolean type.  true or false',
                    required: true,
                }
            */
            var active = false;
            if (req.params.active == 'True' || req.params.active == 'true') {
                active = true;
            }
            res.json(await this._indexerService.getTagLists(active));
        });
    }
}
