import { EntityManager } from '@mikro-orm/core';
import { singleton, inject } from 'tsyringe';
import { AlertSetting } from '../../domain/entities/AlertSetting';
import { BaseRepository } from './BaseRepository';
import { DisasterType } from '../../domain/enums';

@singleton()
export class AlertSettingRepository extends BaseRepository<AlertSetting> {
  constructor(@inject('EntityManager') em: EntityManager) {
    super(em, em.getRepository(AlertSetting));
  }

  async findByRegionAndType(regionId: number, disasterType: DisasterType): Promise<AlertSetting | null> {
    return this.getRepository().findOne({ 
      region: regionId, 
      disasterType 
    });
  }

  async findByRegion(regionId: number): Promise<AlertSetting[]> {
    return this.getRepository().find({ region: regionId });
  }
}
