import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { setupDependencyInjection, container } from './infrastructure/di/container';
import { setupRoutes } from './presentation/routes';
import { GlobalExceptionHandler } from './infrastructure/middleware/GlobalExceptionHandler';
import { LoggerService } from './infrastructure/logging/LoggerService';
import { RedisService } from './infrastructure/cache/RedisService';
import { BackgroundService } from './infrastructure/background/BackgroundService';
import { swaggerSpec } from './infrastructure/swagger/swagger';
import { Config } from './config/config';

export class App {
  public app: Application;
  private logger!: LoggerService;
  private redisService!: RedisService;
  private backgroundService!: BackgroundService;

  constructor() {
    this.app = express();
  }

  async initialize(): Promise<void> {
    // Load environment variables
    require('dotenv').config();

    // Setup dependency injection
    await setupDependencyInjection();

    // Resolve services from container
    this.logger = container.resolve(LoggerService);
    this.redisService = container.resolve(RedisService);
    this.backgroundService = container.resolve(BackgroundService);

    // Connect to Redis
    await this.redisService.connect();

    // Setup middleware
    this.setupMiddleware();

    // Setup routes
    this.setupRoutes();

    // Setup error handling
    this.setupErrorHandling();

    // Start background service
    this.backgroundService.start();

    this.logger.info('Application initialized successfully');
  }

  private setupMiddleware(): void {
    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS (optional)
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      
      next();
    });

    // Swagger documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private setupRoutes(): void {
    const router = setupRoutes();
    this.app.use(router);
  }

  private setupErrorHandling(): void {
    const errorHandler = new GlobalExceptionHandler(this.logger);
    this.app.use(errorHandler.handle);
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down application...');

    // Stop background service
    this.backgroundService.stop();

    // Disconnect from Redis
    await this.redisService.disconnect();

    this.logger.info('Application shutdown complete');
  }
}
