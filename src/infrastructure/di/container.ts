import 'reflect-metadata';
import { container } from 'tsyringe';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import mikroOrmConfig from '../database/mikro-orm.config';

export async function setupDependencyInjection(): Promise<void> {
  // Initialize MikroORM
  const orm = await MikroORM.init(mikroOrmConfig);

  // Register ORM instance
  container.registerInstance('MikroORM', orm);
  
  // Register EntityManager factory that returns the current request context
  // This ensures each request gets its own isolated EntityManager
  container.register('EntityManager', {
    useFactory: () => {
      // Try to get the context EntityManager, fallback to global em for non-request contexts
      return RequestContext.getEntityManager() || orm.em;
    },
  });
  
  // Migrations are now run manually using: npm run migration:up
  // To auto-run migrations on startup, uncomment the lines below:
  // const migrator = orm.getMigrator();
  // await migrator.up();
}

export { container };
