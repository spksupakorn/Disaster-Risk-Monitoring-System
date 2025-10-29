import { EntityManager } from '@mikro-orm/core';
import { singleton, inject } from 'tsyringe';
import { Region } from '../../domain/entities/Region';
import { BaseRepository } from './BaseRepository';

@singleton()
export class RegionRepository extends BaseRepository<Region> {
  constructor(@inject('EntityManager') em: EntityManager) {
    super(em, em.getRepository(Region));
  }

  async findByIdWithSettings(id: number): Promise<Region | null> {
    return this.getRepository().findOne({ id }, { populate: ['alertSettings'] });
  }

  async findAll(): Promise<Region[]> {
    return this.getRepository().findAll({ populate: ['alertSettings'] });
  }
}
