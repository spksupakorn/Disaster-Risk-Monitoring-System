import { singleton } from 'tsyringe';
import { AlertSettingRepository } from '../../infrastructure/repositories/AlertSettingRepository';
import { RegionRepository } from '../../infrastructure/repositories/RegionRepository';
import { LoggerService } from '../../infrastructure/logging/LoggerService';
import { CreateAlertSettingDto, AlertSettingResponseDto } from '../dtos/AlertSettingDto';
import { AlertSetting } from '../../domain/entities/AlertSetting';
import { NotFoundError, ValidationError } from '../../infrastructure/errors/AppError';

@singleton()
export class AlertSettingService {
  constructor(
    private readonly alertSettingRepository: AlertSettingRepository,
    private readonly regionRepository: RegionRepository,
    private readonly logger: LoggerService
  ) {}

  async createAlertSetting(dto: CreateAlertSettingDto): Promise<AlertSettingResponseDto> {
    this.logger.info('Creating alert setting', dto);

    // Validate region exists
    const region = await this.regionRepository.findById(dto.regionId);
    if (!region) {
      throw new NotFoundError(`Region with ID ${dto.regionId} not found`);
    }

    // Validate disaster type is monitored by the region
    if (!region.disasterTypes.includes(dto.disasterType)) {
      throw new ValidationError(
        `Region ${dto.regionId} does not monitor disaster type: ${dto.disasterType}`
      );
    }

    // Check if setting already exists
    const existing = await this.alertSettingRepository.findByRegionAndType(
      dto.regionId,
      dto.disasterType
    );

    if (existing) {
      throw new ValidationError(
        `Alert setting already exists for region ${dto.regionId} and disaster type ${dto.disasterType}`
      );
    }

    const alertSetting = new AlertSetting(region, dto.disasterType, dto.thresholdScore);

    await this.alertSettingRepository.create(alertSetting);

    this.logger.info('Alert setting created', { settingId: alertSetting.id });

    return new AlertSettingResponseDto(
      alertSetting.id,
      region.id,
      alertSetting.disasterType,
      alertSetting.thresholdScore,
      alertSetting.createdAt,
      alertSetting.updatedAt
    );
  }

  async getAlertSettings(): Promise<AlertSettingResponseDto[]> {
    const settings = await this.alertSettingRepository.findAll();

    return settings.map(
      (setting) =>
        new AlertSettingResponseDto(
          setting.id,
          setting.region.id,
          setting.disasterType,
          setting.thresholdScore,
          setting.createdAt,
          setting.updatedAt
        )
    );
  }

  async getAlertSettingsByRegion(regionId: number): Promise<AlertSettingResponseDto[]> {
    const settings = await this.alertSettingRepository.findByRegion(regionId);

    return settings.map(
      (setting) =>
        new AlertSettingResponseDto(
          setting.id,
          setting.region.id,
          setting.disasterType,
          setting.thresholdScore,
          setting.createdAt,
          setting.updatedAt
        )
    );
  }
}
