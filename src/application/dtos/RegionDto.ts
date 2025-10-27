import { z } from 'zod';
import { DisasterType } from '../../domain/enums';

export const CreateRegionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  disasterTypes: z.array(z.nativeEnum(DisasterType)).min(1, 'At least one disaster type is required'),
});

export type CreateRegionDto = z.infer<typeof CreateRegionSchema>;

export class RegionResponseDto {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly disasterTypes: DisasterType[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
