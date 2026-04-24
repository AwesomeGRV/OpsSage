import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { createLogger } from './common/logger';

async function bootstrap() {
  const logger = createLogger();
  const app = await NestFactory.create(AppModule, { logger });
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3003);
  
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGINS')?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });
  
  app.setGlobalPrefix('api/v1');
  
  await app.listen(port);
  
  logger.info(`🚀 OpsSage AI Engine is running on port ${port}`);
}

bootstrap();
