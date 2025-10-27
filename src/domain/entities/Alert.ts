import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { Region } from './Region';
import { DisasterType, RiskLevel, AlertChannel } from '../enums';

@Entity()
export class Alert {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Region)
  region!: Region;

  @Enum(() => DisasterType)
  disasterType!: DisasterType;

  @Enum(() => RiskLevel)
  riskLevel!: RiskLevel;

  @Property()
  riskScore!: number;

  @Property({ type: 'text' })
  message!: string;

  @Enum(() => AlertChannel)
  channel!: AlertChannel;

  @Property({ type: 'text', nullable: true })
  recipient?: string;

  @Property()
  sentAt: Date = new Date();

  @Property()
  createdAt: Date = new Date();

  constructor(
    region: Region,
    disasterType: DisasterType,
    riskLevel: RiskLevel,
    riskScore: number,
    message: string,
    channel: AlertChannel,
    recipient?: string
  ) {
    this.region = region;
    this.disasterType = disasterType;
    this.riskLevel = riskLevel;
    this.riskScore = riskScore;
    this.message = message;
    this.channel = channel;
    this.recipient = recipient;
  }
}
