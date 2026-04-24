import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AIEngineController } from './ai-engine.controller';
import { AIEngineService } from './ai-engine.service';
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
    HttpModule,
  ],
  controllers: [AIEngineController],
  providers: [AIEngineService],
})
export class AppModule {}
