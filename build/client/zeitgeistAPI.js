"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeitgeistApi = void 0;
const baseApi_1 = require("./baseApi");
const const_1 = require("../const");
class ZeitgeistApi extends baseApi_1.BaseApi {
    constructor(endpoints = const_1.networks.zeitgeist.endpoints) {
        super(endpoints);
    }
}
exports.ZeitgeistApi = ZeitgeistApi;
//# sourceMappingURL=zeitgeistAPI.js.map