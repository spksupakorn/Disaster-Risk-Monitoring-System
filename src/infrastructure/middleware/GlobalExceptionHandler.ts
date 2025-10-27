import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { LoggerService } from '../logging/LoggerService';
import { ZodError } from 'zod';

export class GlobalExceptionHandler {
  constructor(private readonly logger: LoggerService) {}

  public handle = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof ZodError) {
      this.handleZodError(err, req, res);
    } else if (err instanceof AppError) {
      this.handleAppError(err, req, res);
    } else {
      this.handleUnknownError(err, req, res);
    }
  };

  private handleZodError(err: ZodError, req: Request, res: Response): void {
    this.logger.warn('Validation error', { path: req.path, errors: err.errors });

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((error) => ({
        field: error.path.join('.'),
        message: error.message,
      })),
    });
  }

  private handleAppError(err: AppError, req: Request, res: Response): void {
    if (err.isOperational) {
      this.logger.warn('Operational error', { path: req.path, message: err.message });
    } else {
      this.logger.error('Non-operational error', err, { path: req.path });
    }

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  private handleUnknownError(err: Error, req: Request, res: Response): void {
    this.logger.error('Unexpected error', err, { path: req.path });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
