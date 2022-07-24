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
exports.StatsService = void 0;
const axios_1 = __importDefault(require("axios"));
const util_1 = require("@polkadot/util");
const inversify_1 = require("inversify");
const containertypes_1 = require("../containertypes");
const tokenStats_1 = require("../models/tokenStats");
const const_1 = require("../const");
const const_2 = require("../const");
const utils_1 = require("../utils");
let StatsService = class StatsService {
    constructor(_apiFactory) {
        this._apiFactory = _apiFactory;
    }
    async getTokenStats() {
        try {
            const api = this._apiFactory.getApiInstance();
            const chainDecimals = await api.getChainDecimals();
            const totalSupply = await api.getTotalSupply();
            const balancesToExclude = await api.getBalances(const_1.addressesToExclude);
            const totalBalancesToExclude = this.getTotalBalanceToExclude(balancesToExclude);
            const getCirculationFromSubscan = await this.getCirculationFromSubscan();
            const circulatingSupply = (0, util_1.hexToBn)((0, util_1.numberToHex)(getCirculationFromSubscan)).sub(totalBalancesToExclude);
            return new tokenStats_1.TokenStats(Math.floor(new Date().getTime() / 1000), this.formatBalance(totalSupply, chainDecimals), this.formatBalance(circulatingSupply, chainDecimals));
        }
        catch (e) {
            console.error(e);
            throw new Error('Unable to fetch token statistics from a node.');
        }
    }
    getTotalBalanceToExclude(balances) {
        const sum = balances
            .map((balance) => {
            return balance.free.add(balance.reserved);
        })
            .reduce((partialSum, b) => partialSum.add(b), new util_1.BN(0));
        return sum;
    }
    formatBalance(balance, chainDecimals) {
        const result = (0, util_1.formatBalance)(balance, { decimals: chainDecimals, withSi: false, forceUnit: '-' }).split('.')[0];
        return parseInt(result.replaceAll(',', ''));
    }
    async getCirculationFromSubscan() {
        try {
            const url = const_2.networks.zeitgeist.subscanUrl + '/api/scan/token';
            const option = (0, utils_1.getSubscanOption)();
            const body = {};
            const result = await axios_1.default.post(url, body, option);
            if (result.data) {
                const available_balance = result.data.data.detail.ZTG.available_balance;
                return new Promise((resolve, reject) => {
                    let ab = Number(available_balance);
                    resolve(ab);
                });
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
};
StatsService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containertypes_1.ContainerTypes.ApiFactory)),
    __metadata("design:paramtypes", [Object])
], StatsService);
exports.StatsService = StatsService;
//# sourceMappingURL=tokenStats.js.map