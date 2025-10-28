import 'reflect-metadata';
import { container } from 'tsyringe';
import { MikroORM } from '@mikro-orm/core';
import mikroOrmConfig from '../database/mikro-orm.config';

export async function setupDependencyInjection(): Promise<void> {
  // Initialize MikroORM
  const orm = await MikroORM.init(mikroOrmConfig);

  // Register ORM instance
  container.registerInstance('MikroORM', orm);
  
  // Migrations are now run manually using: npm run migration:up
  // To auto-run migrations on startup, uncomment the lines below:
  // const migrator = orm.getMigrator();
  // await migrator.up();
}

export { container };
