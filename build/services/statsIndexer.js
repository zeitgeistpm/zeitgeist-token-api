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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsIndexerService = void 0;
const axios_1 = __importDefault(require("axios"));
const inversify_1 = require("inversify");
const containertypes_1 = require("../containertypes");
const const_1 = require("../const");
const utils_1 = require("../utils");
const DEFAULT_RANGE_LENGTH_DAYS = 7;
let StatsIndexerService = class StatsIndexerService {
    constructor(_apiFactory) {
        this._apiFactory = _apiFactory;
    }
    async getValidTransactions(period) {
        const url = const_1.networks.zeitgeist.subscanUrl + '/api/scan/daily';
        const range = this.getDateRange(period);
        const option = (0, utils_1.getSubscanOption)();
        try {
            const result = await axios_1.default.post(url, {
                start: (0, utils_1.getDateYyyyMmDd)(range.start),
                end: (0, utils_1.getDateYyyyMmDd)(range.end),
                format: 'day',
                category: 'transfer',
            }, option);
            return result.data.data.list.map((node) => {
                return [Date.parse(node.time_utc), node.total];
            });
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }
    async getTotalTransfers() {
        const url = const_1.networks.zeitgeist.subscanUrl + '/api/scan/transfers';
        const option = (0, utils_1.getSubscanOption)();
        try {
            const result = await axios_1.default.post(url, {
                row: 1,
                page: 1,
            }, option);
            return result.data.data.count;
        }
        catch (e) {
            console.error(e);
            throw new Error('Unable to fetch number of total transfers. Most likely there is an error fetching data from Subscan API.');
        }
    }
    async getPrice(period) {
        const numberOfDays = this.getPeriodDurationInDays(period);
        try {
            const interval = period === '1 year' ? 'daily' : 'hourly';
            const result = await axios_1.default.get(`https://api.coingecko.com/api/v3/coins/zeitgeist/market_chart?vs_currency=usd&days=${numberOfDays}&interval=${interval}`);
            return result.data.prices;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }
    getDateRange(period) {
        const end = new Date();
        const numberOfDays = this.getPeriodDurationInDays(period);
        const start = new Date();
        start.setDate(start.getDate() - numberOfDays);
        return {
            start,
            end,
        };
    }
    getPeriodDurationInDays(period) {
        const parts = period.toString().split(' ');
        let numberOfDays;
        try {
            numberOfDays = Number(parts[0]) * (parts[1].startsWith('year') ? 365 : 1);
        }
        catch (_a) {
            numberOfDays = DEFAULT_RANGE_LENGTH_DAYS;
        }
        return numberOfDays;
    }
    async getHolders() {
        try {
            const url = const_1.networks.zeitgeist.subscanUrl + '/api/scan/metadata';
            const option = (0, utils_1.getSubscanOption)();
            const body = {};
            const result = await axios_1.default.post(url, body, option);
            if (result.data) {
                const holders = result.data.data.count_account;
                return Number(holders);
            }
            else {
                return 0;
            }
        }
        catch (e) {
            console.error(e);
            throw new Error('Something went wrong. Most likely there is an error fetching data from Subscan API.');
        }
    }
    async getDecimal() {
        try {
            const api = this._apiFactory.getApiInstance();
            const decimal = await api.getChainDecimals();
            return decimal;
        }
        catch (e) {
            console.error(e);
            throw new Error('Something went wrong. Most likely there is an error fetching data from Subscan API.');
        }
    }
};
StatsIndexerService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containertypes_1.ContainerTypes.ApiFactory)),
    __metadata("design:paramtypes", [Object])
], StatsIndexerService);
exports.StatsIndexerService = StatsIndexerService;
//# sourceMappingURL=statsIndexer.js.map