import express, { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { ContainerTypes } from '../containertypes';
import { PeriodType } from '../models/tokenStats';
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

        app.route('/api/v1/app/getTop/:period/getNew/:getNew').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Query the tag numbers of (active) markets'
                #swagger.tags = ['APP']
                #swagger.parameters['period'] = {
                    in: 'path',
                    description: 'The period type.  Supported values: 7 days 30 days, 90 days, 1 year',
                    required: true,
                }
                #swagger.parameters['getNew'] = {
                    in: 'path',
                    type: 'boolean',
                    description: 'The boolean type.  true or false. ',
                    required: true,
                }
            */
            var getNew = false;
            if (req.params.getNew == 'True' || req.params.getNew == 'true') {
                getNew = true;
            }
            res.json(await this._indexerService.getTop(req.params.period as PeriodType, getNew));
        });
    }
}
