import { z } from 'zod';
import { DisasterType } from '../../domain/enums';

export const CreateAlertSettingSchema = z.object({
  regionId: z.number().int().positive(),
  disasterType: z.nativeEnum(DisasterType),
  thresholdScore: z.number().min(0).max(100),
});

export type CreateAlertSettingDto = z.infer<typeof CreateAlertSettingSchema>;

export class AlertSettingResponseDto {
  constructor(
    public readonly id: number,
    public readonly regionId: number,
    public readonly disasterType: DisasterType,
    public readonly thresholdScore: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
