import cron from 'node-cron';
import { singleton } from 'tsyringe';
import { RiskAssessmentService } from '../../application/services/RiskAssessmentService';
import { LoggerService } from '../logging/LoggerService';
import { Config } from '../../config/config';

@singleton()
export class BackgroundService {
  private task: cron.ScheduledTask | null = null;

  constructor(
    private readonly riskAssessmentService: RiskAssessmentService,
    private readonly logger: LoggerService
  ) {}

  start(): void {
    this.logger.info('Starting background service', {
      schedule: Config.backgroundService.riskFetchCron,
    });

    this.task = cron.schedule(Config.backgroundService.riskFetchCron, async () => {
      try {
        this.logger.info('Running scheduled risk assessment');
        await this.riskAssessmentService.assessDisasterRisks();
        this.logger.info('Scheduled risk assessment completed');
      } catch (error) {
        this.logger.error('Scheduled risk assessment failed', error);
      }
    });
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      this.logger.info('Background service stopped');
    }
  }
}
