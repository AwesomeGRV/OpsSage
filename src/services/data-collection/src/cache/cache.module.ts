import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Global()
@Module({})
export class CacheModule {
  static register() {
    return NestCacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        ttl: configService.get<number>('CACHE_TTL', 300),
        max: configService.get<number>('CACHE_MAX', 100),
        isGlobal: true,
      }),
      inject: [ConfigService],
    });
  }
}
