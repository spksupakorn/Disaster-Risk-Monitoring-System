import { Request, Response, NextFunction, Router } from 'express';
import { singleton } from 'tsyringe';
import { AlertService } from '../../application/services/AlertService';
import { SendAlertSchema } from '../../application/dtos/AlertDto';

@singleton()
export class AlertController {
  public router: Router;

  constructor(private readonly alertService: AlertService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/send', this.sendAlert.bind(this));
    this.router.get('/', this.getLatestAlerts.bind(this));
    this.router.get('/region/:regionId', this.getAlertsByRegion.bind(this));
  }

  private async sendAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = SendAlertSchema.parse(req.body);
      const result = await this.alertService.sendAlert(dto);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  private async getLatestAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.alertService.getLatestAlerts();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  private async getAlertsByRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const regionId = parseInt(req.params.regionId, 10);
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const result = await this.alertService.getAlertsByRegion(regionId, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
