/**
 * Centralized Error Monitoring, Redaction & Health Diagnostics
 * Prevents error information leakage (stack traces, server paths) to clients.
 */

import { Request, Response, NextFunction } from 'express';

export interface SystemErrorLog {
  id: string;
  timestamp: string;
  path: string;
  method: string;
  statusCode: number;
  message: string;
  ip: string;
}

class ErrorMonitorService {
  private logs: SystemErrorLog[] = [];
  private maxLogs: number = 100;
  private startTime: number = Date.now();

  public logError(
    req: Request,
    err: any,
    statusCode: number = 500
  ): SystemErrorLog {
    const rawMessage = err instanceof Error ? err.message : String(err || 'Unknown error');
    // Sanitize message: never include file system paths
    const sanitizedMessage = rawMessage.replace(/\/[\w\.\-]+/g, '[REDACTED_PATH]');

    const record: SystemErrorLog = {
      id: `err-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      path: req.originalUrl || req.url || '/',
      method: req.method,
      statusCode,
      message: sanitizedMessage,
      ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
    };

    this.logs.unshift(record);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    console.error(`[SYSTEM_ERROR] ${record.method} ${record.path} - ${statusCode}: ${record.message}`);
    return record;
  }

  public getRecentLogs(limit: number = 50): SystemErrorLog[] {
    return this.logs.slice(0, limit);
  }

  public getHealthStatus() {
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      status: 'UP',
      uptimeSeconds: uptimeSec,
      totalErrorsRecorded: this.logs.length,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      nodeVersion: process.version,
    };
  }
}

export const errorMonitor = new ErrorMonitorService();

/**
 * Express error-handling middleware that shields clients from stack traces
 */
export function errorHandlerMiddleware(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.status || err.statusCode || 500;
  errorMonitor.logError(req, err, statusCode);

  // In production or development, NEVER expose stack traces or raw internals in HTTP response
  res.status(statusCode).json({
    error:
      statusCode === 404
        ? 'The requested resource was not found.'
        : statusCode === 400
        ? (err.message || 'Invalid request payload.')
        : statusCode === 401
        ? 'Authentication required.'
        : statusCode === 403
        ? 'Access forbidden.'
        : 'An unexpected internal error occurred. Please try again or contact support.',
    code: err.code || 'INTERNAL_ERROR',
  });
}
