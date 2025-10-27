import { DisasterType, RiskLevel } from '../../domain/enums';

export class DisasterRiskReportDto {
  constructor(
    public readonly regionId: number,
    public readonly regionName: string,
    public readonly disasterType: DisasterType,
    public readonly riskScore: number,
    public readonly riskLevel: RiskLevel,
    public readonly alertTriggered: boolean,
    public readonly details: Record<string, any>
  ) {}
}

export class GetDisasterRisksResponseDto {
  constructor(
    public readonly reports: DisasterRiskReportDto[],
    public readonly timestamp: Date
  ) {}
}
