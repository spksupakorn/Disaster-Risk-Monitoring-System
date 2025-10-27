import { EntityManager, EntityRepository, AnyEntity } from '@mikro-orm/core';

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

  async findById(id: number): Promise<T | null> {
    return this.repository.findOne({ id } as any);
  }

  async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  async create(entity: T): Promise<T> {
    await this.em.persistAndFlush(entity);
    return entity;
  }

  async update(entity: T): Promise<T> {
    await this.em.flush();
    return entity;
  }

  async delete(id: number): Promise<void> {
    const entity = await this.findById(id);
    if (entity) {
      await this.em.removeAndFlush(entity);
    }
  }
}
