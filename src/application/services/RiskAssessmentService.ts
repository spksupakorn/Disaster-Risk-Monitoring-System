import { singleton } from 'tsyringe';
import { OpenWeatherService, WeatherData } from './OpenWeatherService';
import { USGSService, EarthquakeData } from './USGSService';
import { RegionRepository } from '../../infrastructure/repositories/RegionRepository';
import { AlertSettingRepository } from '../../infrastructure/repositories/AlertSettingRepository';
import { RedisService } from '../../infrastructure/cache/RedisService';
import { LoggerService } from '../../infrastructure/logging/LoggerService';
import { DisasterRiskReportDto, GetDisasterRisksResponseDto } from '../dtos/DisasterRiskDto';
import { DisasterType, RiskLevel } from '../../domain/enums';
import { Config } from '../../config/config';
import { NotFoundError } from '../../infrastructure/errors/AppError';

interface RiskData {
  weatherData?: WeatherData;
  earthquakeData?: EarthquakeData | null;
}

@singleton()
export class RiskAssessmentService {
  private readonly CACHE_KEY_PREFIX = 'risk_data';
  private readonly CACHE_TTL = Config.redis.cacheTTL;

  constructor(
    private readonly weatherService: OpenWeatherService,
    private readonly usgsService: USGSService,
    private readonly regionRepository: RegionRepository,
    private readonly alertSettingRepository: AlertSettingRepository,
    private readonly redisService: RedisService,
    private readonly logger: LoggerService
  ) {}

  async assessDisasterRisks(): Promise<GetDisasterRisksResponseDto> {
    this.logger.info('Starting disaster risk assessment');

    const regions = await this.regionRepository.findAll();
    const reports: DisasterRiskReportDto[] = [];

    for (const region of regions) {
      for (const disasterType of region.disasterTypes) {
        try {
          const report = await this.assessRegionDisasterRisk(region.id, disasterType);
          reports.push(report);
        } catch (error) {
          this.logger.error(`Failed to assess ${disasterType} risk for region ${region.id}`, error);
        }
      }
    }

    return new GetDisasterRisksResponseDto(reports, new Date());
  }

  async assessRegionDisasterRisk(regionId: number, disasterType: DisasterType): Promise<DisasterRiskReportDto> {
    const region = await this.regionRepository.findById(regionId);
    if (!region) {
      throw new NotFoundError(`Region with ID ${regionId} not found`);
    }

    // Check cache first
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${regionId}:${disasterType}`;
    const cached = await this.redisService.get<RiskData>(cacheKey);

    let riskData: RiskData;
    if (cached) {
      this.logger.debug('Using cached risk data', { regionId, disasterType });
      riskData = cached;
    } else {
      this.logger.debug('Fetching fresh risk data', { regionId, disasterType });
      riskData = await this.fetchRiskData(region.latitude, region.longitude, disasterType);
      await this.redisService.set(cacheKey, riskData, this.CACHE_TTL);
    }

    const riskScore = this.calculateRiskScore(disasterType, riskData);
    const riskLevel = this.determineRiskLevel(riskScore);

    // Check if alert should be triggered
    const alertSetting = await this.alertSettingRepository.findByRegionAndType(regionId, disasterType);
    const alertTriggered = alertSetting ? riskScore >= alertSetting.thresholdScore : false;

    return new DisasterRiskReportDto(
      region.id,
      region.name,
      disasterType,
      riskScore,
      riskLevel,
      alertTriggered,
      this.extractDetails(disasterType, riskData)
    );
  }

  private async fetchRiskData(latitude: number, longitude: number, disasterType: DisasterType): Promise<RiskData> {
    const riskData: RiskData = {};

    switch (disasterType) {
      case DisasterType.FLOOD:
      case DisasterType.WILDFIRE:
        riskData.weatherData = await this.weatherService.getWeatherData(latitude, longitude);
        break;
      case DisasterType.EARTHQUAKE:
        riskData.earthquakeData = await this.usgsService.getEarthquakeData(latitude, longitude);
        break;
    }

    return riskData;
  }

  private calculateRiskScore(disasterType: DisasterType, riskData: RiskData): number {
    switch (disasterType) {
      case DisasterType.FLOOD:
        return this.calculateFloodRisk(riskData.weatherData!);
      case DisasterType.WILDFIRE:
        return this.calculateWildfireRisk(riskData.weatherData!);
      case DisasterType.EARTHQUAKE:
        return this.calculateEarthquakeRisk(riskData.earthquakeData);
      default:
        return 0;
    }
  }

  private calculateFloodRisk(weatherData: WeatherData): number {
    // Risk increases with rainfall
    // 0mm = 0, 50mm+ = 100
    const rainfall = weatherData.rainfall;
    const threshold = Config.riskThresholds.flood.high;
    
    return Math.min(100, (rainfall / threshold) * 100);
  }

  private calculateWildfireRisk(weatherData: WeatherData): number {
    // Risk increases with high temperature and low humidity
    const temp = weatherData.temperature;
    const humidity = weatherData.humidity;
    
    const tempThreshold = Config.riskThresholds.wildfire.temperature;
    const humidityThreshold = Config.riskThresholds.wildfire.humidity;

    // Temperature score (0-50)
    const tempScore = temp >= tempThreshold ? 50 : (temp / tempThreshold) * 50;
    
    // Humidity score (0-50), inverse relationship
    const humidityScore = humidity <= humidityThreshold ? 50 : 50 - ((humidity - humidityThreshold) / 70) * 50;

    return Math.min(100, tempScore + humidityScore);
  }

  private calculateEarthquakeRisk(earthquakeData: EarthquakeData | null | undefined): number {
    if (!earthquakeData) {
      return 0; // No recent earthquake activity
    }

    // Risk based on magnitude
    // < 5.0 = low, >= 5.0 = high
    const magnitude = earthquakeData.magnitude;
    const threshold = Config.riskThresholds.earthquake.high;

    if (magnitude >= threshold) {
      return 100;
    } else if (magnitude >= threshold - 1) {
      return 70;
    } else if (magnitude >= threshold - 2) {
      return 40;
    } else {
      return 20;
    }
  }

  private determineRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= 70) {
      return RiskLevel.HIGH;
    } else if (riskScore >= 40) {
      return RiskLevel.MEDIUM;
    } else {
      return RiskLevel.LOW;
    }
  }

  private extractDetails(disasterType: DisasterType, riskData: RiskData): Record<string, any> {
    switch (disasterType) {
      case DisasterType.FLOOD:
        return {
          rainfall: riskData.weatherData?.rainfall,
          humidity: riskData.weatherData?.humidity,
          description: riskData.weatherData?.description,
        };
      case DisasterType.WILDFIRE:
        return {
          temperature: riskData.weatherData?.temperature,
          humidity: riskData.weatherData?.humidity,
          description: riskData.weatherData?.description,
        };
      case DisasterType.EARTHQUAKE:
        return riskData.earthquakeData
          ? {
              magnitude: riskData.earthquakeData.magnitude,
              depth: riskData.earthquakeData.depth,
              place: riskData.earthquakeData.place,
              time: riskData.earthquakeData.time,
            }
          : { message: 'No recent earthquake activity' };
      default:
        return {};
    }
  }
}
