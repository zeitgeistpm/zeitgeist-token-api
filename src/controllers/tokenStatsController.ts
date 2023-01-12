import express, { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { ContainerTypes } from '../containertypes';
import { IPriceProvider } from '../services/iPriceProvider';
import { IStatsIndexerService, PeriodType } from '../services/statsIndexer';
import { IStatsService } from '../services/tokenStats';
import { ControllerBase } from './controllerBase';
import { IControllerBase } from './iControllerBase';

@injectable()
export class TokenStatsController extends ControllerBase implements IControllerBase {
    constructor(
        @inject(ContainerTypes.StatsService) private _statsService: IStatsService,
        @inject(ContainerTypes.StatsIndexerService) private _indexerService: IStatsIndexerService,
        @inject(ContainerTypes.PriceProviderWithFailover) private _priceProvider: IPriceProvider,
    ) {
        super();
    }

    public register(app: express.Application): void {
        /**
         * @description Test route
         */
        app.route('/api/v1/token/stats').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Get current token stats'
                #swagger.tags = ['Token']
            */
            try {
                res.json(await this._statsService.getTokenStats());
            } catch (err) {
                this.handleError(res, err as Error);
            }
        });

        /**
         * @description Token current price route v1.
         */
        app.route('/api/v1/token/price').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Get current token price'
                #swagger.tags = ['Token']
            */
            try {
                res.json(await this._priceProvider.getUsdPrice());
            } catch (err) {
                this.handleError(res, err as Error);
            }
        });

        /**
         * @description Token circulation route v1.
         */
        app.route('/api/v1/token/circulation').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Get current token circulation'
                #swagger.tags = ['Token']
            */
            try {
                res.json(await (await this._statsService.getTokenStats()).circulatingSupply);
            } catch (err) {
                this.handleError(res, err as Error);
            }
        });

        /**
         * @description Token price route v1.
         */
        app.route('/api/v1/token/price/:period').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Get token price in a specific period'
                #swagger.tags = ['Token']
            */
            res.json(await this._indexerService.getPrice(req.params.period as PeriodType));
        });

        /**
         * @description Token Holders.
         */
        app.route('/api/v1/token/holders').get(async (req: Request, res: Response) => {
            /*
                #swagger.description = 'Get the number of current token holders'
                #swagger.tags = ['Token']
            */
            res.json(await this._indexerService.getHolders());
        });
    }
}
