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
            /*
                #swagger.description = 'Query the numbers of total tx'
                #swagger.tags = ['Node']
            */
            res.json(await this._indexerService.getTransactionCount());
        });

        app.route('/api/v1/node/tx-perblock/:period').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Query the numbers of tx in a specific period'
                #swagger.tags = ['Node']
                #swagger.parameters['period'] = {
                    in: 'path',
                    description: 'The period type.  Supported values: 7 days 30 days, 90 days, 1 year',
                    required: true,
                }
            */
            res.json(await this._indexerService.getValidTransactions(req.params.period as PeriodType));
        });

        app.route('/api/v1/node/addressLists/:start/:end').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Query the numbers of tx in a specific period'
                #swagger.tags = ['Node']
                #swagger.parameters['start'] = {
                    in: 'path',
                    description: 'The String type.  Format: 1900-01-01',
                    required: true,
                #swagger.parameters['end'] = {
                    in: 'path',
                    description: 'The String type.  Format: 1900-01-01',
                    required: true,
                }
            */
            res.json(await this._indexerService.fetchAddressLists(req.params.start, req.params.end));
        });

        app.route('/api/v1/node/txLists/:start/:end').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Query the numbers of tx in a specific period'
                #swagger.tags = ['Node']
                #swagger.parameters['start'] = {
                    in: 'path',
                    description: 'The String type.  Format: 1900-01-01',
                    required: true,
                #swagger.parameters['end'] = {
                    in: 'path',
                    description: 'The String type.  Format: 1900-01-01',
                    required: true,
                }
            */
            res.json(await this._indexerService.fetchTxLists(req.params.start, req.params.end));
        });
    }
}
