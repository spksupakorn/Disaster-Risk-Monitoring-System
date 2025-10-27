import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { Region } from './Region';
import { DisasterType } from '../enums';

@Entity()
export class AlertSetting {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Region)
  region!: Region;

  @Enum(() => DisasterType)
  disasterType!: DisasterType;

  @Property()
  thresholdScore!: number;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(region: Region, disasterType: DisasterType, thresholdScore: number) {
    this.region = region;
    this.disasterType = disasterType;
    this.thresholdScore = thresholdScore;
  }
}
