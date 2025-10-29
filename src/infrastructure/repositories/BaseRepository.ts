import { EntityManager, EntityRepository, AnyEntity, RequestContext } from '@mikro-orm/core';

export interface IRepository<T extends AnyEntity> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: number): Promise<void>;
}

export abstract class BaseRepository<T extends AnyEntity> implements IRepository<T> {
  constructor(
    protected readonly em: EntityManager,
    protected readonly repository: EntityRepository<T>
  ) {}

  // Get the current EntityManager from RequestContext or use the injected one
  protected getEntityManager(): EntityManager {
    return RequestContext.getEntityManager() || this.em;
  }

  // Get the current repository for the entity
  protected getRepository(): EntityRepository<T> {
    const entityName = this.repository.getEntityName();
    return this.getEntityManager().getRepository(entityName) as unknown as EntityRepository<T>;
  }

  async findById(id: number): Promise<T | null> {
    return this.getRepository().findOne({ id } as any);
  }

  async findAll(): Promise<T[]> {
    return this.getRepository().findAll();
  }

  async create(entity: T): Promise<T> {
    const em = this.getEntityManager();
    await em.persistAndFlush(entity);
    return entity;
  }

  async update(entity: T): Promise<T> {
    const em = this.getEntityManager();
    await em.flush();
    return entity;
  }

  async delete(id: number): Promise<void> {
    const entity = await this.findById(id);
    if (entity) {
      const em = this.getEntityManager();
      await em.removeAndFlush(entity);
    }
  }
}
