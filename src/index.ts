// Fix for breaking change introduced in polkadot js v7.x
// https://polkadot.js.org/docs/api/FAQ/#since-upgrading-to-the-7x-series-typescript-augmentation-is-missing
import '@polkadot/api-augment';
import 'dotenv/config';
// Fix end
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import swagger from 'swagger-ui-express';
import container from './container';
import { IControllerBase } from './controllers/iControllerBase';
import { ContainerTypes } from './containertypes';
import swaggerFile from './swagger_output.json';

const listenPort = process.env.PORT || 3000;
const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Get all controllers and register all endpoints.
const controllers: IControllerBase[] = container.getAll<IControllerBase>(ContainerTypes.Controller);
controllers.forEach((controller) => controller.register(app));

app.use('/', swagger.serve, swagger.setup(swaggerFile));
app.listen(listenPort, () => {
    console.log('Server is listening on port ', listenPort);
});

module.exports = app;
