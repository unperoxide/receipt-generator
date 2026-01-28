import { ZodError } from 'zod';
import logger from './logger.js';

export function errorHandler(err, req, res, next) {
    if (err instanceof ZodError) {
        logger.warn('Validation error', { errors: err.errors });
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
    }

    logger.error('Unhandled error', {
        message: err.message,
        stack: err.stack,
        path: req.path,
    });

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(statusCode).json({
        success: false,
        error: message,
        code: err.code || 'INTERNAL_ERROR',
    });
}

export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
