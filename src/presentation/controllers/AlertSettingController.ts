import { Request, Response, NextFunction, Router } from 'express';
import { singleton } from 'tsyringe';
import { AlertSettingService } from '../../application/services/AlertSettingService';
import { CreateAlertSettingSchema } from '../../application/dtos/AlertSettingDto';

@singleton()
export class AlertSettingController {
  public router: Router;

  constructor(private readonly alertSettingService: AlertSettingService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', this.createAlertSetting.bind(this));
    this.router.get('/', this.getAlertSettings.bind(this));
    this.router.get('/region/:regionId', this.getAlertSettingsByRegion.bind(this));
  }

  private async createAlertSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = CreateAlertSettingSchema.parse(req.body);
      const result = await this.alertSettingService.createAlertSetting(dto);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  private async getAlertSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.alertSettingService.getAlertSettings();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  private async getAlertSettingsByRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const regionId = parseInt(req.params.regionId, 10);
      const result = await this.alertSettingService.getAlertSettingsByRegion(regionId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
