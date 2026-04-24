import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  
  await app.listen(port);
  
  console.log(`🚀 OpsSage Incident Analysis Service is running on port ${port}`);
}

bootstrap();
