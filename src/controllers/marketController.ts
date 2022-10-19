import express, { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { ContainerTypes } from '../containertypes';
import { IMarketIndexerService } from '../services/marketIndexer';
import { IControllerBase } from './iControllerBase';

@injectable()
export class MarketController implements IControllerBase {
    constructor(@inject(ContainerTypes.MarketIndexerService) private _indexerService: IMarketIndexerService) {}

    public register(app: express.Application): void {
        /**
         * @description Transactions route v1.
         */
        app.route('/api/v1/market/count').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Query the numbers of total markets'
            */
            res.json(await this._indexerService.getMarketCount());
        });
    }
}
