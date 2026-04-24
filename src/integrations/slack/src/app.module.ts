import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SlackBotController } from './slack-bot.controller';
import { SlackBotService } from './slack-bot.service';
import { SlackBotGateway } from './slack-bot.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
  ],
  controllers: [SlackBotController],
  providers: [SlackBotService, SlackBotGateway],
})
export class AppModule {}
