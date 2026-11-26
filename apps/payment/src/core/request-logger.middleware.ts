import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();
        res.on('finish', () => {
            const { method, originalUrl } = req;
            const { statusCode } = res;
            const ms = Date.now() - start;

            this.logger.log(`${method} ${originalUrl} ${statusCode} - ${ms}ms`);
        });
        next();
    }
}