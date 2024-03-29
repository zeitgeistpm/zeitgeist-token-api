const swaggerAutogen = require('swagger-autogen')();
// import swaggerAutogen from 'swagger-autogen';

const outputFile = 'src/swagger_output.json';
const endpointsFiles = [
    'src/controllers/tokenStatsController.ts',
    'src/controllers/nodeController.ts',
    'src/controllers/appController.ts',
    'src/controllers/devController.ts',
];

const getDocumentation = (host) => ({
    info: {
        version: '1.0.0',
        title: 'Zeitgeist token API',
        description: 'Provides network statistic information.',
    },
    host: host ? host : 'localhost:3000',
    schemes: ['https','http'],
});

const args = process.argv.slice(2); // first two args are 'node' and command name
swaggerAutogen(outputFile, endpointsFiles, getDocumentation(args[0]));
