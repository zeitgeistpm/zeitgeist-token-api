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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiFactory = void 0;
const inversify_1 = require("inversify");
const container_1 = __importDefault(require("../container"));
const containertypes_1 = require("../containertypes");
const const_1 = require("../const");
let ApiFactory = class ApiFactory {
    getApiInstance(networkName = 'zeitgeist') {
        try {
            return container_1.default.getNamed(containertypes_1.ContainerTypes.Api, networkName);
        }
        catch (_a) {
            console.warn(`IZeitgeistApi container for ${networkName} network not found. Falling back to Zeitgeist`);
            return container_1.default.getNamed(containertypes_1.ContainerTypes.Api, const_1.networks.zeitgeist.name);
        }
    }
};
ApiFactory = __decorate([
    (0, inversify_1.injectable)()
], ApiFactory);
exports.ApiFactory = ApiFactory;
//# sourceMappingURL=apiFactory.js.map