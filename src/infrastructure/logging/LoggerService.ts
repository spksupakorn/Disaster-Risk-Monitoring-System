import pino from 'pino';
import { singleton } from 'tsyringe';
import { Config } from '../../config/config';

@singleton()
export class LoggerService {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: Config.server.nodeEnv === 'production' ? 'info' : 'debug',
      transport:
        Config.server.nodeEnv === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    });
  }

  public info(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  public error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (error instanceof Error) {
      this.logger.error({ err: error, ...args }, message);
    } else {
      this.logger.error({ error, ...args }, message);
    }
  }

  public warn(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }

  public debug(message: string, ...args: any[]): void {
    this.logger.debug(message, ...args);
  }
}
