import axios, { AxiosInstance } from 'axios';
import { singleton } from 'tsyringe';
import { Config } from '../../config/config';
import { LoggerService } from '../../infrastructure/logging/LoggerService';
import { ExternalServiceError } from '../../infrastructure/errors/AppError';

export interface EarthquakeData {
  magnitude: number;
  depth: number;
  place: string;
  time: Date;
}

@singleton()
export class USGSService {
  private client: AxiosInstance;

  constructor(private readonly logger: LoggerService) {
    this.client = axios.create({
      timeout: 10000,
    });
  }

  async getEarthquakeData(latitude: number, longitude: number, radiusKm: number = 100): Promise<EarthquakeData | null> {
    try {
      this.logger.debug('Fetching earthquake data', { latitude, longitude, radiusKm });

      // Get earthquakes from the last 24 hours within radius
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

      const response = await this.client.get(Config.externalApis.usgs.apiUrl, {
        params: {
          format: 'geojson',
          starttime: startTime.toISOString(),
          endtime: endTime.toISOString(),
          latitude,
          longitude,
          maxradiuskm: radiusKm,
          orderby: 'magnitude',
        },
      });

      const features = response.data.features;

      if (!features || features.length === 0) {
        this.logger.debug('No recent earthquakes found');
        return null;
      }

      // Get the strongest earthquake
      const earthquake = features[0];
      const properties = earthquake.properties;

      return {
        magnitude: properties.mag,
        depth: earthquake.geometry.coordinates[2], // depth in km
        place: properties.place,
        time: new Date(properties.time),
      };
    } catch (error: any) {
      this.logger.error('Failed to fetch earthquake data', error);
      throw new ExternalServiceError(`USGS API error: ${error.message}`);
    }
  }
}
