import { Module, Global } from '@nestjs/common';

@Global()
@Module({})
export class LoggerModule {
  // This module provides logging utilities but doesn't need to export anything
  // since we're using Winston directly in services
}
