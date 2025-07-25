const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Beacon Burial API',
      version: '1.0.0',
      description: 'API cho hệ thống quản lý tang lễ',
    },
    servers: [
      {
        url: 'http://localhost:9999/api', 
      },
    ],
  },
  apis: ['./api/routes/*.js'], 
};
const specs = swaggerJsdoc(options);
module.exports = {
  swaggerUi,
  specs,
};
