import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Config } from '../../config/config';
import { Region } from '../../domain/entities/Region';
import { AlertSetting } from '../../domain/entities/AlertSetting';
import { Alert } from '../../domain/entities/Alert';

const isProduction = Config.server.nodeEnv === 'production';

const config: Options = {
  driver: PostgreSqlDriver,
  host: Config.database.host,
  port: Config.database.port,
  dbName: Config.database.name,
  user: Config.database.user,
  password: Config.database.password,
  entities: [Region, AlertSetting, Alert],
  debug: Config.server.nodeEnv === 'development',
  
  // Production-ready connection pool settings
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    acquireTimeoutMillis: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT || '30000', 10),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
  },

  // SSL configuration for production
  driverOptions: {
    connection: {
      ssl: isProduction && Config.database.sslEnabled
        ? {
            rejectUnauthorized: Config.database.sslRejectUnauthorized,
            // For cloud providers like AWS RDS, Azure, etc.
            // ca: fs.readFileSync('/path/to/server-certificates/root.crt').toString(),
          }
        : false,
    },
  },

  migrations: {
    path: './dist/infrastructure/database/migrations',
    pathTs: './src/infrastructure/database/migrations',
    disableForeignKeys: false,
    allOrNothing: true, // Wrap all migrations in a transaction
    transactional: true,
    emit: 'ts',
  },

  // Production optimizations
  allowGlobalContext: false, // Prevent accidental global context usage
  validate: true, // Validate entities on startup
  strict: true, // Strict mode for better type safety
};

export default config;
