import { singleton } from 'tsyringe';
import { RegionRepository } from '../../infrastructure/repositories/RegionRepository';
import { LoggerService } from '../../infrastructure/logging/LoggerService';
import { CreateRegionDto, RegionResponseDto } from '../dtos/RegionDto';
import { Region } from '../../domain/entities/Region';
import { NotFoundError } from '../../infrastructure/errors/AppError';

@singleton()
export class RegionService {
  constructor(
    private readonly regionRepository: RegionRepository,
    private readonly logger: LoggerService
  ) {}

  async createRegion(dto: CreateRegionDto): Promise<RegionResponseDto> {
    this.logger.info('Creating new region', dto);

    const region = new Region(dto.name, dto.latitude, dto.longitude, dto.disasterTypes);

    await this.regionRepository.create(region);

    this.logger.info('Region created', { regionId: region.id });

    return new RegionResponseDto(
      region.id,
      region.name,
      region.latitude,
      region.longitude,
      region.disasterTypes,
      region.createdAt,
      region.updatedAt
    );
  }

  async getRegions(): Promise<RegionResponseDto[]> {
    const regions = await this.regionRepository.findAll();

    return regions.map(
      (region) =>
        new RegionResponseDto(
          region.id,
          region.name,
          region.latitude,
          region.longitude,
          region.disasterTypes,
          region.createdAt,
          region.updatedAt
        )
    );
  }

  async getRegionById(id: number): Promise<RegionResponseDto> {
    const region = await this.regionRepository.findById(id);

    if (!region) {
      throw new NotFoundError(`Region with ID ${id} not found`);
    }

    return new RegionResponseDto(
      region.id,
      region.name,
      region.latitude,
      region.longitude,
      region.disasterTypes,
      region.createdAt,
      region.updatedAt
    );
  }
}
