import { EntityManager, MikroORM } from '@mikro-orm/core';
import { singleton } from 'tsyringe';

@singleton()
export class UnitOfWork {
  constructor(private readonly orm: MikroORM) {}

  async execute<T>(work: (em: EntityManager) => Promise<T>): Promise<T> {
    const em = this.orm.em.fork();
    
    try {
      await em.begin();
      const result = await work(em);
      await em.commit();
      return result;
    } catch (error) {
      await em.rollback();
      throw error;
    }
  }

  getEntityManager(): EntityManager {
    return this.orm.em.fork();
  }
}
