"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CoinGeckoPriceProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceProviderWithFailover = exports.CoinGeckoPriceProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const inversify_1 = require("inversify");
const container_1 = __importDefault(require("../container"));
const containertypes_1 = require("../containertypes");
let CoinGeckoPriceProvider = CoinGeckoPriceProvider_1 = class CoinGeckoPriceProvider {
    async getUsdPrice() {
        const url = `${CoinGeckoPriceProvider_1.BaseUrl}/simple/price?ids=zeitgeist&vs_currencies=usd`;
        const result = await axios_1.default.get(url);
        if (result.data['zeitgeist']) {
            const price = result.data['zeitgeist'].usd;
            return Number(price);
        }
        return 0;
    }
    async getTokenId(symbol) {
        var _a;
        if (!CoinGeckoPriceProvider_1.tokens) {
            CoinGeckoPriceProvider_1.tokens = await this.getTokenList();
        }
        return (_a = CoinGeckoPriceProvider_1.tokens.find((x) => x.symbol.toLowerCase() === symbol.toLowerCase())) === null || _a === void 0 ? void 0 : _a.id;
    }
    async getTokenList() {
        const url = `${CoinGeckoPriceProvider_1.BaseUrl}/coins/list`;
        const result = await axios_1.default.get(url);
        return result.data;
    }
};
CoinGeckoPriceProvider.BaseUrl = 'https://api.coingecko.com/api/v3';
CoinGeckoPriceProvider = CoinGeckoPriceProvider_1 = __decorate([
    (0, inversify_1.injectable)()
], CoinGeckoPriceProvider);
exports.CoinGeckoPriceProvider = CoinGeckoPriceProvider;
let PriceProviderWithFailover = class PriceProviderWithFailover {
    async getUsdPrice() {
        const providers = container_1.default.getAll(containertypes_1.ContainerTypes.PriceProvider);
        for (const provider of providers) {
            try {
                return await provider.getUsdPrice();
            }
            catch (error) {
                console.log(error);
            }
        }
        return 0;
    }
};
PriceProviderWithFailover = __decorate([
    (0, inversify_1.injectable)()
], PriceProviderWithFailover);
exports.PriceProviderWithFailover = PriceProviderWithFailover;
//# sourceMappingURL=priceProvider.js.map