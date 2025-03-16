import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express API',
      version: '1.0.0',
      description: 'API documentation using Swagger',
    },
    servers: [{ url: 'http://localhost:3434' }],
  },
  apis: process.env.NodeEnv !== "local" ? ['./src/routes/*.ts'] : ['./src/dist/*.ts'] ,
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
