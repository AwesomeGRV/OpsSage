import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { createLogger } from './common/logger';

async function bootstrap() {
  const logger = createLogger();
  const app = await NestFactory.create(AppModule, { logger });
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3002);
  
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGINS')?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });
  
  app.setGlobalPrefix('api/v1');
  
  await app.listen(port);
  
  logger.info(`🚀 OpsSage Data Collection Service is running on port ${port}`);
}

bootstrap();
