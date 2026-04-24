import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SlackBotService } from './slack-bot.service';

@ApiTags('slack-bot')
@Controller('slack-bot')
export class SlackBotController {
  constructor(private readonly slackBotService: SlackBotService) {}

  @Post('events')
  @ApiOperation({ summary: 'Handle Slack events' })
  @ApiResponse({ status: 200, description: 'Event processed successfully' })
  async handleEvents(@Body() body: any) {
    const app = this.slackBotService.getApp();
    return app.receiver(body);
  }

  @Post('interactive')
  @ApiOperation({ summary: 'Handle Slack interactive components' })
  @ApiResponse({ status: 200, description: 'Interactive action processed successfully' })
  async handleInteractive(@Body() body: any) {
    const app = this.slackBotService.getApp();
    return app.receiver(body);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for Slack bot' })
  @ApiResponse({ status: 200, description: 'Bot is healthy' })
  async health() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'slack-bot',
      version: '1.0.0',
    };
  }
}
