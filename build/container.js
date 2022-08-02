"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
const tokenStatsController_1 = require("./controllers/tokenStatsController");
const tokenStats_1 = require("./services/tokenStats");
const const_1 = require("./const");
const apiFactory_1 = require("./client/apiFactory");
const statsIndexer_1 = require("./services/statsIndexer");
const nodeController_1 = require("./controllers/nodeController");
const zeitgeistAPI_1 = require("./client/zeitgeistAPI");
const containertypes_1 = require("./containertypes");
const priceProvider_1 = require("./services/priceProvider");
const container = new inversify_1.Container();
container
    .bind(containertypes_1.ContainerTypes.Api)
    .toConstantValue(new zeitgeistAPI_1.ZeitgeistApi(const_1.networks.zeitgeist.endpoints))
    .whenTargetNamed(const_1.networks.zeitgeist.name);
container.bind(containertypes_1.ContainerTypes.ApiFactory).to(apiFactory_1.ApiFactory).inSingletonScope();
container.bind(containertypes_1.ContainerTypes.StatsService).to(tokenStats_1.StatsService).inSingletonScope();
container.bind(containertypes_1.ContainerTypes.StatsIndexerService).to(statsIndexer_1.StatsIndexerService).inSingletonScope();
container.bind(containertypes_1.ContainerTypes.PriceProvider).to(priceProvider_1.CoinGeckoPriceProvider).inSingletonScope();
container
    .bind(containertypes_1.ContainerTypes.PriceProviderWithFailover)
    .to(priceProvider_1.PriceProviderWithFailover)
    .inSingletonScope();
container.bind(containertypes_1.ContainerTypes.Controller).to(tokenStatsController_1.TokenStatsController);
container.bind(containertypes_1.ContainerTypes.Controller).to(nodeController_1.NodeController);
exports.default = container;
//# sourceMappingURL=container.js.map