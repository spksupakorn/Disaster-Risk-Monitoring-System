import { RiskAssessmentService } from '../../application/services/RiskAssessmentService';
import { OpenWeatherService } from '../../application/services/OpenWeatherService';
import { USGSService } from '../../application/services/USGSService';
import { RegionRepository } from '../../infrastructure/repositories/RegionRepository';
import { AlertSettingRepository } from '../../infrastructure/repositories/AlertSettingRepository';
import { RedisService } from '../../infrastructure/cache/RedisService';
import { LoggerService } from '../../infrastructure/logging/LoggerService';
import { DisasterType, RiskLevel } from '../../domain/enums';
import { Region } from '../../domain/entities/Region';
import { AlertSetting } from '../../domain/entities/AlertSetting';

describe('RiskAssessmentService', () => {
  let service: RiskAssessmentService;
  let mockWeatherService: jest.Mocked<OpenWeatherService>;
  let mockUSGSService: jest.Mocked<USGSService>;
  let mockRegionRepository: jest.Mocked<RegionRepository>;
  let mockAlertSettingRepository: jest.Mocked<AlertSettingRepository>;
  let mockRedisService: jest.Mocked<RedisService>;
  let mockLogger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    // Create mocks
    mockWeatherService = {
      getWeatherData: jest.fn(),
    } as any;

    mockUSGSService = {
      getEarthquakeData: jest.fn(),
    } as any;

    mockRegionRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
    } as any;

    mockAlertSettingRepository = {
      findByRegionAndType: jest.fn(),
    } as any;

    mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    service = new RiskAssessmentService(
      mockWeatherService,
      mockUSGSService,
      mockRegionRepository,
      mockAlertSettingRepository,
      mockRedisService,
      mockLogger
    );
  });

  describe('assessRegionDisasterRisk', () => {
    it('should assess flood risk correctly', async () => {
      // Arrange
      const region = new Region('Test Region', 40.7128, -74.006, [DisasterType.FLOOD]);
      region.id = 1;

      mockRegionRepository.findById.mockResolvedValue(region);
      mockRedisService.get.mockResolvedValue(null);
      mockWeatherService.getWeatherData.mockResolvedValue({
        temperature: 25,
        humidity: 80,
        rainfall: 60,
        description: 'Heavy rain',
      });
      mockAlertSettingRepository.findByRegionAndType.mockResolvedValue(null);

      // Act
      const result = await service.assessRegionDisasterRisk(1, DisasterType.FLOOD);

      // Assert
      expect(result.regionId).toBe(1);
      expect(result.disasterType).toBe(DisasterType.FLOOD);
      expect(result.riskScore).toBeGreaterThan(0);
      expect(result.riskLevel).toBe(RiskLevel.HIGH);
      expect(mockWeatherService.getWeatherData).toHaveBeenCalledWith(40.7128, -74.006);
    });

    it('should use cached data when available', async () => {
      // Arrange
      const region = new Region('Test Region', 40.7128, -74.006, [DisasterType.FLOOD]);
      region.id = 1;

      const cachedData = {
        weatherData: {
          temperature: 25,
          humidity: 80,
          rainfall: 30,
          description: 'Light rain',
        },
      };

      mockRegionRepository.findById.mockResolvedValue(region);
      mockRedisService.get.mockResolvedValue(cachedData);
      mockAlertSettingRepository.findByRegionAndType.mockResolvedValue(null);

      // Act
      const result = await service.assessRegionDisasterRisk(1, DisasterType.FLOOD);

      // Assert
      expect(mockWeatherService.getWeatherData).not.toHaveBeenCalled();
      expect(result.riskScore).toBeGreaterThan(0);
    });

    it('should trigger alert when threshold is exceeded', async () => {
      // Arrange
      const region = new Region('Test Region', 40.7128, -74.006, [DisasterType.FLOOD]);
      region.id = 1;

      const alertSetting = new AlertSetting(region, DisasterType.FLOOD, 50);

      mockRegionRepository.findById.mockResolvedValue(region);
      mockRedisService.get.mockResolvedValue(null);
      mockWeatherService.getWeatherData.mockResolvedValue({
        temperature: 25,
        humidity: 80,
        rainfall: 100,
        description: 'Heavy rain',
      });
      mockAlertSettingRepository.findByRegionAndType.mockResolvedValue(alertSetting);

      // Act
      const result = await service.assessRegionDisasterRisk(1, DisasterType.FLOOD);

      // Assert
      expect(result.alertTriggered).toBe(true);
    });
  });
});
