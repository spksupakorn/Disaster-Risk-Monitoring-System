import { EntityManager } from '@mikro-orm/core';
import { singleton, inject } from 'tsyringe';
import { Alert } from '../../domain/entities/Alert';
import { BaseRepository } from './BaseRepository';

@singleton()
export class AlertRepository extends BaseRepository<Alert> {
  constructor(@inject('EntityManager') em: EntityManager) {
    super(em, em.getRepository(Alert));
  }

  async findLatestByRegion(): Promise<Alert[]> {
    // Get all alerts and group by region, keeping only the latest
    const allAlerts = await this.getRepository().findAll({
      orderBy: { sentAt: 'DESC' },
      populate: ['region'],
    });

    const latestByRegion = new Map<number, Alert>();
    
    for (const alert of allAlerts) {
      const regionId = alert.region.id;
      if (!latestByRegion.has(regionId)) {
        latestByRegion.set(regionId, alert);
      }
    }

    return Array.from(latestByRegion.values());
  }

  async findByRegion(regionId: number, limit: number = 10): Promise<Alert[]> {
    return this.getRepository().find(
      { region: regionId },
      { 
        orderBy: { sentAt: 'DESC' },
        limit 
      }
    );
  }
}
