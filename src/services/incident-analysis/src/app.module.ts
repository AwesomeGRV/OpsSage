import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { IncidentAnalysisService } from './incident-analysis.service';
import { IncidentAnalysisController } from './incident-analysis.controller';
import { Incident } from './entities/incident.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'opssage',
      password: 'opssage123',
      database: 'opssage',
      entities: [Incident],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Incident]),
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 300,
    }),
  ],
  controllers: [IncidentAnalysisController],
  providers: [IncidentAnalysisService],
})
export class AppModule {}
