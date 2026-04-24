import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { Logger } from 'winston';
import { createLogger } from './common/logger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = createLogger();
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGINS')?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(logger),
    new ResponseInterceptor(),
  );

  // API prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Swagger documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('OpsSage API')
      .setDescription('Intelligent Incident Copilot API')
      .setVersion('1.0')
      .addApiKey(
        { type: 'apiKey', name: 'X-API-Key', in: 'header' },
        'API Key'
      )
      .addBearerAuth()
      .addTag('incidents')
      .addTag('analysis')
      .addTag('runbooks')
      .addTag('integrations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version,
    });
  });

  // Readiness check endpoint
  app.get('/ready', (req, res) => {
    // Add dependencies check here
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: 'connected', // Add actual DB check
        redis: 'connected', // Add actual Redis check
      },
    });
  });

  // Metrics endpoint
  app.get('/metrics', (req, res) => {
    // Add Prometheus metrics here
    res.set('Content-Type', 'text/plain');
    res.send('# HELP opssage_api_requests_total Total number of API requests\n# TYPE opssage_api_requests_total counter\nopssage_api_requests_total 0\n');
  });

  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  await app.listen(port, host);

  logger.info(`🚀 OpsSage API Gateway is running on: http://${host}:${port}`);
  logger.info(`📚 API Documentation: http://${host}:${port}/api/docs`);
  logger.info(`🏥 Health Check: http://${host}:${port}/health`);
  logger.info(`📊 Metrics: http://${host}:${port}/metrics`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
