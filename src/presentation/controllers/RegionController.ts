import { Request, Response, NextFunction, Router } from 'express';
import { singleton } from 'tsyringe';
import { RegionService } from '../../application/services/RegionService';
import { CreateRegionSchema } from '../../application/dtos/RegionDto';

@singleton()
export class RegionController {
  public router: Router;

  constructor(private readonly regionService: RegionService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', this.createRegion.bind(this));
    this.router.get('/', this.getRegions.bind(this));
    this.router.get('/:id', this.getRegionById.bind(this));
  }

  private async createRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = CreateRegionSchema.parse(req.body);
      const result = await this.regionService.createRegion(dto);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  private async getRegions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.regionService.getRegions();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  private async getRegionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.regionService.getRegionById(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
