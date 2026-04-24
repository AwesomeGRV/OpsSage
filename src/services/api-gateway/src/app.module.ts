import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { IncidentsModule } from './incidents/incidents.module';
import { AnalysisModule } from './analysis/analysis.module';
import { RunbooksModule } from './runbooks/runbooks.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Core modules
    DatabaseModule,
    CacheModule,
    LoggerModule,

    // Security
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Feature modules
    IncidentsModule,
    AnalysisModule,
    RunbooksModule,
    IntegrationsModule,
    HealthModule,
    MetricsModule,

    // Route registration
    RouterModule.register([
      {
        path: 'incidents',
        module: IncidentsModule,
      },
      {
        path: 'analysis',
        module: AnalysisModule,
      },
      {
        path: 'runbooks',
        module: RunbooksModule,
      },
      {
        path: 'integrations',
        module: IntegrationsModule,
      },
      {
        path: 'health',
        module: HealthModule,
      },
      {
        path: 'metrics',
        module: MetricsModule,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
