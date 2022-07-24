"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenStatsController = void 0;
const inversify_1 = require("inversify");
const containertypes_1 = require("../containertypes");
const controllerBase_1 = require("./controllerBase");
let TokenStatsController = class TokenStatsController extends controllerBase_1.ControllerBase {
    constructor(_statsService, _indexerService, _priceProvider) {
        super();
        this._statsService = _statsService;
        this._indexerService = _indexerService;
        this._priceProvider = _priceProvider;
    }
    register(app) {
        app.route('/api/v1/token/stats').get(async (req, res) => {
            try {
                res.json(await this._statsService.getTokenStats());
            }
            catch (err) {
                this.handleError(res, err);
            }
        });
        app.route('/api/v1/token/price').get(async (req, res) => {
            try {
                res.json(await this._priceProvider.getUsdPrice());
            }
            catch (err) {
                this.handleError(res, err);
            }
        });
        app.route('/api/v1/token/circulation').get(async (req, res) => {
            try {
                res.json(await (await this._statsService.getTokenStats()).circulatingSupply);
            }
            catch (err) {
                this.handleError(res, err);
            }
        });
        app.route('/api/v1/token/price/:period').get(async (req, res) => {
            res.json(await this._indexerService.getPrice(req.params.period));
        });
        app.route('/api/v1/token/holders').get(async (req, res) => {
            res.json(await this._indexerService.getHolders());
        });
    }
};
TokenStatsController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containertypes_1.ContainerTypes.StatsService)),
    __param(1, (0, inversify_1.inject)(containertypes_1.ContainerTypes.StatsIndexerService)),
    __param(2, (0, inversify_1.inject)(containertypes_1.ContainerTypes.PriceProviderWithFailover)),
    __metadata("design:paramtypes", [Object, Object, Object])
], TokenStatsController);
exports.TokenStatsController = TokenStatsController;
//# sourceMappingURL=tokenStatsController.js.map