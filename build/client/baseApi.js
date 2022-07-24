"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseApi = void 0;
const api_1 = require("@polkadot/api");
const const_1 = require("../const");
class BaseApi {
    constructor(endpoint = const_1.networks.zeitgeist.endpoint) {
        this.endpoint = endpoint;
    }
    async getTotalSupply() {
        await this.connect();
        return await this._api.query.balances.totalIssuance();
    }
    async getBalances(addresses) {
        await this.connect();
        const balances = await this._api.query.system.account.multi(addresses);
        return balances.map((balance) => balance.data);
    }
    async getChainDecimals() {
        await this.connect();
        const decimals = this._api.registry.chainDecimals;
        return decimals[0];
    }
    async getChainName() {
        await this.connect();
        return (await this._api.rpc.system.chain()).toString();
    }
    async connect() {
        if (!this._api) {
            const provider = new api_1.WsProvider(this.endpoint);
            const api = new api_1.ApiPromise({ provider });
            this._api = await api.isReady;
        }
        return this._api;
    }
}
exports.BaseApi = BaseApi;
//# sourceMappingURL=baseApi.js.map