// Import required by Inversify IoC, otherwise 'Reflect.hasOwnMetadata is not a function' exception is thrown
// during types resolution.
import 'reflect-metadata';

import { Container } from 'inversify';
import { IControllerBase } from './controllers/iControllerBase';
import { TokenStatsController } from './controllers/tokenStatsController';
import { IStatsService, StatsService } from './services/tokenStats';
import { IZeitgeistApi } from './client/baseApi';
import { networks } from './const';
import { ApiFactory, IApiFactory } from './client/apiFactory';
import { IStatsIndexerService, StatsIndexerService } from './services/statsIndexer';
import { NodeController } from './controllers/nodeController';
import { ZeitgeistApi } from './client/zeitgeistAPI';
import { ContainerTypes } from './containertypes';
import { IPriceProvider } from './services/iPriceProvider';
import { CoinGeckoPriceProvider, PriceProviderWithFailover } from './services/priceProvider';
import { IAPPIndexerService, APPIndexerService } from './services/appIndexer';
import { APPController } from './controllers/appController';
import { DevIndexerService, IDevIndexerService } from './services/devIndexer';
import { DevController } from './controllers/devController';

const container = new Container();

// data access
container
    .bind<IZeitgeistApi>(ContainerTypes.Api)
    .toConstantValue(new ZeitgeistApi(networks.zeitgeist.endpoints))
    .whenTargetNamed(networks.zeitgeist.name);
container.bind<IApiFactory>(ContainerTypes.ApiFactory).to(ApiFactory).inSingletonScope();

// services registration
container.bind<IStatsService>(ContainerTypes.StatsService).to(StatsService).inSingletonScope();
container.bind<IStatsIndexerService>(ContainerTypes.StatsIndexerService).to(StatsIndexerService).inSingletonScope();
container.bind<IAPPIndexerService>(ContainerTypes.MarketIndexerService).to(APPIndexerService).inSingletonScope();
container.bind<IDevIndexerService>(ContainerTypes.DevIndexerService).to(DevIndexerService).inSingletonScope();
container.bind<IPriceProvider>(ContainerTypes.PriceProvider).to(CoinGeckoPriceProvider).inSingletonScope();
container
    .bind<IPriceProvider>(ContainerTypes.PriceProviderWithFailover)
    .to(PriceProviderWithFailover)
    .inSingletonScope();

// controllers registration
container.bind<IControllerBase>(ContainerTypes.Controller).to(TokenStatsController);
container.bind<IControllerBase>(ContainerTypes.Controller).to(NodeController);
container.bind<IControllerBase>(ContainerTypes.Controller).to(APPController);
container.bind<IControllerBase>(ContainerTypes.Controller).to(DevController);

export default container;
