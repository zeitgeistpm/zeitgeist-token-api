"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscanOption = exports.getDateYyyyMmDd = exports.getDateUTC = void 0;
const getDateUTC = (date) => {
    const utcDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    return new Date(utcDate);
};
exports.getDateUTC = getDateUTC;
const getDateYyyyMmDd = (date) => {
    return date.toISOString().split('T')[0];
};
exports.getDateYyyyMmDd = getDateYyyyMmDd;
const getSubscanOption = () => {
    const apiKey = String(process.env.SUBSCAN_API_KEY);
    const options = {};
    if (apiKey) {
        options.headers = { 'X-API-Key': apiKey };
    }
    return options;
};
exports.getSubscanOption = getSubscanOption;
//# sourceMappingURL=utils.js.map