import { Entity, PrimaryKey, Property, Collection, OneToMany, Enum } from '@mikro-orm/core';
import { AlertSetting } from './AlertSetting';
import { Alert } from './Alert';
import { DisasterType } from '../enums';

@Entity()
export class Region {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ type: 'decimal', precision: 10, scale: 7 })
  latitude!: number;

  @Property({ type: 'decimal', precision: 10, scale: 7 })
  longitude!: number;

  @Property({ type: 'json' })
  disasterTypes!: DisasterType[];

  @OneToMany(() => AlertSetting, (setting) => setting.region)
  alertSettings = new Collection<AlertSetting>(this);

  @OneToMany(() => Alert, (alert) => alert.region)
  alerts = new Collection<Alert>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(name: string, latitude: number, longitude: number, disasterTypes: DisasterType[]) {
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.disasterTypes = disasterTypes;
  }
}
