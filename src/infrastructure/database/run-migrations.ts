import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import mikroOrmConfig from './mikro-orm.config';

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    const orm = await MikroORM.init(mikroOrmConfig);
    const migrator = orm.getMigrator();
    
    const pending = await migrator.getPendingMigrations();
    console.log(`Found ${pending.length} pending migrations`);
    
    await migrator.up();
    console.log('✅ Migrations completed successfully!');
    
    await orm.close(true);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
