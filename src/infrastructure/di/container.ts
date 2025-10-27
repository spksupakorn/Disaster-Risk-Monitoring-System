import 'reflect-metadata';
import { container } from 'tsyringe';
import { MikroORM, EntityManager } from '@mikro-orm/core';
import mikroOrmConfig from '../database/mikro-orm.config';

export async function setupDependencyInjection(): Promise<void> {
  // Initialize MikroORM
  const orm = await MikroORM.init(mikroOrmConfig);

  // Register ORM and EntityManager
  container.registerInstance('MikroORM', orm);
  container.registerInstance('EntityManager', orm.em);

  // Run migrations
  const migrator = orm.getMigrator();
  await migrator.up();
}

export { container };
