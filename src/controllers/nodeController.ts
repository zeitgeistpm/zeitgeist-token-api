import express, { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { ContainerTypes } from '../containertypes';
import { IStatsIndexerService, PeriodType } from '../services/statsIndexer';
import { IControllerBase } from './iControllerBase';

@injectable()
export class NodeController implements IControllerBase {
    constructor(@inject(ContainerTypes.StatsIndexerService) private _indexerService: IStatsIndexerService) {}

    public register(app: express.Application): void {
        /**
         * @description Transactions route v1.
         */
        app.route('/api/v1/node/tx-perblock/total').get(async (req: Request, res: Response) => {
            res.json(await this._indexerService.getTotalTransfers());
        });

        app.route('/api/v1/node/tx-perblock/:period').get(async (req: Request, res: Response) => {
            res.json(await this._indexerService.getValidTransactions(req.params.period as PeriodType));
        });

        app.route('/api/v1/node/get-decimal').get(async (req: Request, res: Response) => {
            res.json(await this._indexerService.getDecimal());
        });
    }
}
