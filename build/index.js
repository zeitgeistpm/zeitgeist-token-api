"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@polkadot/api-augment");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const container_1 = __importDefault(require("./container"));
const containertypes_1 = require("./containertypes");
const swagger_output_json_1 = __importDefault(require("./swagger_output.json"));
const listenPort = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '5mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
const controllers = container_1.default.getAll(containertypes_1.ContainerTypes.Controller);
controllers.forEach((controller) => controller.register(app));
app.use('/', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default));
app.listen(listenPort, () => {
    console.log('Server is listening on port ', listenPort);
});
module.exports = app;
//# sourceMappingURL=index.js.map