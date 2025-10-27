import axios, { AxiosInstance } from 'axios';
import { singleton } from 'tsyringe';
import { Config } from '../../config/config';
import { LoggerService } from '../../infrastructure/logging/LoggerService';
import { ExternalServiceError } from '../../infrastructure/errors/AppError';

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  description: string;
}

@singleton()
export class OpenWeatherService {
  private client: AxiosInstance;

  constructor(private readonly logger: LoggerService) {
    this.client = axios.create({
      baseURL: Config.externalApis.openWeather.baseUrl,
      timeout: 10000,
    });
  }

  async getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      this.logger.debug('Fetching weather data', { latitude, longitude });

      const response = await this.client.get('/weather', {
        params: {
          lat: latitude,
          lon: longitude,
          appid: Config.externalApis.openWeather.apiKey,
          units: 'metric',
        },
      });

      const data = response.data;
      
      // Extract rainfall from rain object (last 1 hour)
      const rainfall = data.rain?.['1h'] || 0;

      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        rainfall,
        description: data.weather[0]?.description || '',
      };
    } catch (error: any) {
      this.logger.error('Failed to fetch weather data', error);
      throw new ExternalServiceError(`OpenWeather API error: ${error.message}`);
    }
  }
}
