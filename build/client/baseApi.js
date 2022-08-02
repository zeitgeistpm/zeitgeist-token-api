"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseApi = void 0;
const api_1 = require("@polkadot/api");
const const_1 = require("../const");
class BaseApi {
    constructor(endpoints = const_1.networks.zeitgeist.endpoints) {
        this.endpoints = endpoints;
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
    async connect(index) {
        let apiNow;
        const currentIndex = index !== null && index !== void 0 ? index : 0;
        if (!this._api || index) {
            const provider = new api_1.WsProvider(this.endpoints[currentIndex]);
            apiNow = new api_1.ApiPromise({ provider });
        }
        else {
            apiNow = this._api;
        }
        return await apiNow.isReadyOrError.then((api) => {
            this._api = api;
            return api;
        }, async () => {
            apiNow.disconnect();
            const nextNetworkIndex = this.getNexttNetwork(currentIndex);
            console.warn(`Connection to ${this.endpoints[currentIndex]} failed. Try ${this.endpoints[nextNetworkIndex]}`);
            return await this.connect(nextNetworkIndex);
        });
    }
    getNexttNetwork(index) {
        return (index + 1) % this.endpoints.length;
    }
}
exports.BaseApi = BaseApi;
//# sourceMappingURL=baseApi.js.map