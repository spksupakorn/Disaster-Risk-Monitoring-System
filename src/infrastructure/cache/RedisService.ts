import { createClient, RedisClientType } from 'redis';
import { singleton } from 'tsyringe';
import { Config } from '../../config/config';
import { LoggerService } from '../logging/LoggerService';

@singleton()
export class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor(private readonly logger: LoggerService) {
    this.client = createClient({
      socket: {
        host: Config.redis.host,
        port: Config.redis.port,
      },
      password: Config.redis.password,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err);
    });

    this.client.on('connect', () => {
      this.logger.info('Redis connected');
      this.isConnected = true;
    });
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Redis GET error', error);
      return null;
    }
  }

  public async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      this.logger.error('Redis SET error', error);
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error('Redis DELETE error', error);
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error('Redis EXISTS error', error);
      return false;
    }
  }
}
