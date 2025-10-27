import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Config } from '../../config/config';
import { Region } from '../../domain/entities/Region';
import { AlertSetting } from '../../domain/entities/AlertSetting';
import { Alert } from '../../domain/entities/Alert';

const config: Options = {
  driver: PostgreSqlDriver,
  host: Config.database.host,
  port: Config.database.port,
  dbName: Config.database.name,
  user: Config.database.user,
  password: Config.database.password,
  entities: [Region, AlertSetting, Alert],
  debug: Config.server.nodeEnv === 'development',
  migrations: {
    path: './dist/infrastructure/database/migrations',
    pathTs: './src/infrastructure/database/migrations',
  },
};

export default config;
