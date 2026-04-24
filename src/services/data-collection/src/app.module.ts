import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { DataCollectionController } from './data-collection.controller';
import { DataCollectionService } from './data-collection.service';
import { DatadogCollector } from './collectors/datadog.collector';
import { KubernetesCollector } from './collectors/kubernetes.collector';
import { PagerDutyCollector } from './collectors/pagerduty.collector';
import { CacheModule } from './cache/cache.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    CacheModule,
    LoggerModule,
  ],
  controllers: [DataCollectionController],
  providers: [
    DataCollectionService,
    DatadogCollector,
    KubernetesCollector,
    PagerDutyCollector,
  ],
})
export class AppModule {}
