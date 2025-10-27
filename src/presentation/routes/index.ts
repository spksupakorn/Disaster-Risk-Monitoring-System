import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { RegionController } from '../controllers/RegionController';
import { AlertSettingController } from '../controllers/AlertSettingController';
import { DisasterRiskController } from '../controllers/DisasterRiskController';
import { AlertController } from '../controllers/AlertController';

export function setupRoutes(): Router {
  const router = Router();

  // Resolve controllers from DI container
  const regionController = container.resolve(RegionController);
  const alertSettingController = container.resolve(AlertSettingController);
  const disasterRiskController = container.resolve(DisasterRiskController);
  const alertController = container.resolve(AlertController);

  /**
   * @swagger
   * /api/regions:
   *   post:
   *     summary: Create a new region
   *     tags: [Regions]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, latitude, longitude, disasterTypes]
   *             properties:
   *               name: { type: string }
   *               latitude: { type: number }
   *               longitude: { type: number }
   *               disasterTypes: { type: array, items: { type: string } }
   *     responses:
   *       201:
   *         description: Region created successfully
   *       400:
   *         description: Validation error
   */
  router.use('/api/regions', regionController.router);

  /**
   * @swagger
   * /api/alert-settings:
   *   post:
   *     summary: Create alert setting
   *     tags: [Alert Settings]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [regionId, disasterType, thresholdScore]
   *             properties:
   *               regionId: { type: integer }
   *               disasterType: { type: string }
   *               thresholdScore: { type: number }
   *     responses:
   *       201:
   *         description: Alert setting created successfully
   */
  router.use('/api/alert-settings', alertSettingController.router);

  /**
   * @swagger
   * /api/disaster-risks:
   *   get:
   *     summary: Get disaster risk reports for all regions
   *     tags: [Disaster Risks]
   *     responses:
   *       200:
   *         description: Risk reports retrieved successfully
   */
  router.use('/api/disaster-risks', disasterRiskController.router);

  /**
   * @swagger
   * /api/alerts:
   *   get:
   *     summary: Get latest alerts
   *     tags: [Alerts]
   *     responses:
   *       200:
   *         description: Alerts retrieved successfully
   */
  router.use('/api/alerts', alertController.router);

  return router;
}
