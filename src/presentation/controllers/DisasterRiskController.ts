import { Request, Response, NextFunction, Router } from 'express';
import { singleton } from 'tsyringe';
import { RiskAssessmentService } from '../../application/services/RiskAssessmentService';

@singleton()
export class DisasterRiskController {
  public router: Router;

  constructor(private readonly riskAssessmentService: RiskAssessmentService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.getDisasterRisks.bind(this));
  }

  private async getDisasterRisks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.riskAssessmentService.assessDisasterRisks();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
