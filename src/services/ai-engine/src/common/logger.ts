import { Logger as NestLogger } from '@nestjs/common';
import * as winston from 'winston';

export function createLogger(): winston.Logger {
  const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  );

  const transports = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ];

  // Add file transport in production
  if (process.env.NODE_ENV === 'production') {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: logFormat,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: logFormat,
      }),
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports,
    exitOnError: false,
  });
}

export class Logger extends NestLogger {
  private winston: winston.Logger;
  private context: string;

  constructor(context?: string) {
    super(context);
    this.context = context || 'AIEngine';
    this.winston = createLogger();
  }

  log(message: string, context?: string) {
    this.winston.info(message, { context: context || this.context });
    super.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.winston.error(message, { trace, context: context || this.context });
    super.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.winston.warn(message, { context: context || this.context });
    super.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.winston.debug(message, { context: context || this.context });
    super.debug(message, context);
  }

  verbose(message: string, context?: string) {
    this.winston.verbose(message, { context: context || this.context });
    super.verbose(message, context);
  }
}
