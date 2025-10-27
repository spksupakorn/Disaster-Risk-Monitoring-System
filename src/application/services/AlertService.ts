import { singleton } from 'tsyringe';
import { RegionRepository } from '../../infrastructure/repositories/RegionRepository';
import { AlertRepository } from '../../infrastructure/repositories/AlertRepository';
import { MessagingService } from './MessagingService';
import { RiskAssessmentService } from './RiskAssessmentService';
import { LoggerService } from '../../infrastructure/logging/LoggerService';
import { AlertResponseDto, SendAlertDto } from '../dtos/AlertDto';
import { Alert } from '../../domain/entities/Alert';
import { NotFoundError } from '../../infrastructure/errors/AppError';
import { DisasterType, AlertChannel } from '../../domain/enums';

@singleton()
export class AlertService {
  constructor(
    private readonly regionRepository: RegionRepository,
    private readonly alertRepository: AlertRepository,
    private readonly messagingService: MessagingService,
    private readonly riskAssessmentService: RiskAssessmentService,
    private readonly logger: LoggerService
  ) {}

  async sendAlert(dto: SendAlertDto): Promise<AlertResponseDto> {
    this.logger.info('Sending alert', dto);

    // Get region
    const region = await this.regionRepository.findById(dto.regionId);
    if (!region) {
      throw new NotFoundError(`Region with ID ${dto.regionId} not found`);
    }

    // Assess current risk
    const riskReport = await this.riskAssessmentService.assessRegionDisasterRisk(
      dto.regionId,
      dto.disasterType
    );

    // Create alert message
    const message = this.createAlertMessage(
      region.name,
      dto.disasterType,
      riskReport.riskLevel,
      riskReport.riskScore,
      riskReport.details
    );

    // Send alert via messaging service
    if (dto.recipient) {
      await this.messagingService.sendAlert(dto.channel, dto.recipient, message);
    }

    // Save alert to database
    const alert = new Alert(
      region,
      dto.disasterType,
      riskReport.riskLevel,
      riskReport.riskScore,
      message,
      dto.channel,
      dto.recipient
    );

    await this.alertRepository.create(alert);

    this.logger.info('Alert sent and saved', { alertId: alert.id });

    return new AlertResponseDto(
      alert.id,
      region.id,
      alert.disasterType,
      alert.riskLevel,
      alert.riskScore,
      alert.message,
      alert.channel,
      alert.recipient,
      alert.sentAt
    );
  }

  async getLatestAlerts(): Promise<AlertResponseDto[]> {
    const alerts = await this.alertRepository.findLatestByRegion();

    return alerts.map(
      (alert) =>
        new AlertResponseDto(
          alert.id,
          alert.region.id,
          alert.disasterType,
          alert.riskLevel,
          alert.riskScore,
          alert.message,
          alert.channel,
          alert.recipient,
          alert.sentAt
        )
    );
  }

  async getAlertsByRegion(regionId: number, limit: number = 10): Promise<AlertResponseDto[]> {
    const alerts = await this.alertRepository.findByRegion(regionId, limit);

    return alerts.map(
      (alert) =>
        new AlertResponseDto(
          alert.id,
          alert.region.id,
          alert.disasterType,
          alert.riskLevel,
          alert.riskScore,
          alert.message,
          alert.channel,
          alert.recipient,
          alert.sentAt
        )
    );
  }

  private createAlertMessage(
    regionName: string,
    disasterType: DisasterType,
    riskLevel: string,
    riskScore: number,
    details: Record<string, any>
  ): string {
    let message = `DISASTER ALERT\n\n`;
    message += `Region: ${regionName}\n`;
    message += `Disaster Type: ${disasterType.toUpperCase()}\n`;
    message += `Risk Level: ${riskLevel.toUpperCase()}\n`;
    message += `Risk Score: ${riskScore.toFixed(2)}\n\n`;

    message += `Details:\n`;
    for (const [key, value] of Object.entries(details)) {
      message += `- ${key}: ${value}\n`;
    }

    message += `\nPlease take appropriate precautions and follow local emergency guidelines.`;

    return message;
  }
}
