import { RegionService } from '../../application/services/RegionService';
import { RegionRepository } from '../../infrastructure/repositories/RegionRepository';
import { LoggerService } from '../../infrastructure/logging/LoggerService';
import { DisasterType } from '../../domain/enums';
import { Region } from '../../domain/entities/Region';

describe('RegionService', () => {
  let service: RegionService;
  let mockRegionRepository: jest.Mocked<RegionRepository>;
  let mockLogger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    mockRegionRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    service = new RegionService(mockRegionRepository, mockLogger);
  });

  describe('createRegion', () => {
    it('should create a region successfully', async () => {
      // Arrange
      const dto = {
        name: 'California',
        latitude: 36.7783,
        longitude: -119.4179,
        disasterTypes: [DisasterType.WILDFIRE, DisasterType.EARTHQUAKE],
      };

      const createdRegion = new Region(dto.name, dto.latitude, dto.longitude, dto.disasterTypes);
      createdRegion.id = 1;

      mockRegionRepository.create.mockResolvedValue(createdRegion);

      // Act
      const result = await service.createRegion(dto);

      // Assert
      expect(result.name).toBe(dto.name);
      expect(result.latitude).toBe(dto.latitude);
      expect(result.longitude).toBe(dto.longitude);
      expect(result.disasterTypes).toEqual(dto.disasterTypes);
      expect(mockRegionRepository.create).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Creating new region', dto);
    });
  });

  describe('getRegions', () => {
    it('should return all regions', async () => {
      // Arrange
      const regions = [
        Object.assign(new Region('Region 1', 10, 20, [DisasterType.FLOOD]), { id: 1 }),
        Object.assign(new Region('Region 2', 30, 40, [DisasterType.EARTHQUAKE]), { id: 2 }),
      ];

      mockRegionRepository.findAll.mockResolvedValue(regions);

      // Act
      const result = await service.getRegions();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Region 1');
      expect(result[1].name).toBe('Region 2');
    });
  });
});
