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
exports.NodeController = void 0;
const inversify_1 = require("inversify");
const containertypes_1 = require("../containertypes");
let NodeController = class NodeController {
    constructor(_indexerService) {
        this._indexerService = _indexerService;
    }
    register(app) {
        app.route('/api/v1/node/tx-perblock/total').get(async (req, res) => {
            res.json(await this._indexerService.getTotalTransfers());
        });
        app.route('/api/v1/node/tx-perblock/:period').get(async (req, res) => {
            res.json(await this._indexerService.getValidTransactions(req.params.period));
        });
        app.route('/api/v1/node/get-decimal').get(async (req, res) => {
            res.json(await this._indexerService.getDecimal());
        });
    }
};
NodeController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containertypes_1.ContainerTypes.StatsIndexerService)),
    __metadata("design:paramtypes", [Object])
], NodeController);
exports.NodeController = NodeController;
//# sourceMappingURL=nodeController.js.map