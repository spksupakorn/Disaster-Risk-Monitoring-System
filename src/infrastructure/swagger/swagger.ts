import swaggerJsdoc from 'swagger-jsdoc';
import { Config } from '../../config/config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Disaster Risk Monitoring System API',
      version: '1.0.0',
      description: 'RESTful API for monitoring and assessing disaster risks across regions',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${Config.server.port}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Region: {
          type: 'object',
          required: ['name', 'latitude', 'longitude', 'disasterTypes'],
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            latitude: { type: 'number', minimum: -90, maximum: 90 },
            longitude: { type: 'number', minimum: -180, maximum: 180 },
            disasterTypes: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['flood', 'earthquake', 'wildfire'],
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AlertSetting: {
          type: 'object',
          required: ['regionId', 'disasterType', 'thresholdScore'],
          properties: {
            id: { type: 'integer' },
            regionId: { type: 'integer' },
            disasterType: {
              type: 'string',
              enum: ['flood', 'earthquake', 'wildfire'],
            },
            thresholdScore: { type: 'number', minimum: 0, maximum: 100 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        DisasterRiskReport: {
          type: 'object',
          properties: {
            regionId: { type: 'integer' },
            regionName: { type: 'string' },
            disasterType: {
              type: 'string',
              enum: ['flood', 'earthquake', 'wildfire'],
            },
            riskScore: { type: 'number' },
            riskLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
            },
            alertTriggered: { type: 'boolean' },
            details: { type: 'object' },
          },
        },
        Alert: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            regionId: { type: 'integer' },
            disasterType: {
              type: 'string',
              enum: ['flood', 'earthquake', 'wildfire'],
            },
            riskLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
            },
            riskScore: { type: 'number' },
            message: { type: 'string' },
            channel: {
              type: 'string',
              enum: ['sms', 'email'],
            },
            recipient: { type: 'string' },
            sentAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Regions', description: 'Region management endpoints' },
      { name: 'Alert Settings', description: 'Alert configuration endpoints' },
      { name: 'Disaster Risks', description: 'Risk assessment endpoints' },
      { name: 'Alerts', description: 'Alert management endpoints' },
    ],
  },
  apis: ['./src/presentation/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
