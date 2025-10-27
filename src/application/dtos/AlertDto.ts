import { z } from 'zod';
import { DisasterType, RiskLevel, AlertChannel } from '../../domain/enums';

export const SendAlertSchema = z.object({
  regionId: z.number().int().positive(),
  disasterType: z.nativeEnum(DisasterType),
  channel: z.nativeEnum(AlertChannel),
  recipient: z.string().optional(),
});

export type SendAlertDto = z.infer<typeof SendAlertSchema>;

export class AlertResponseDto {
  constructor(
    public readonly id: number,
    public readonly regionId: number,
    public readonly disasterType: DisasterType,
    public readonly riskLevel: RiskLevel,
    public readonly riskScore: number,
    public readonly message: string,
    public readonly channel: AlertChannel,
    public readonly recipient: string | undefined,
    public readonly sentAt: Date
  ) {}
}
