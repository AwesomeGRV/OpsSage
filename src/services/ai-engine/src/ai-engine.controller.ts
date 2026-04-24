import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AIEngineService, AnalysisRequest, AnalysisResult } from './ai-engine.service';

@ApiTags('ai-engine')
@Controller('ai-engine')
export class AIEngineController {
  constructor(private readonly aiEngineService: AIEngineService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze incident using AI' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Analysis completed successfully' })
  async analyzeIncident(@Body() request: AnalysisRequest): Promise<AnalysisResult> {
    return this.aiEngineService.analyzeIncident(request);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for AI engine service' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Service is healthy' })
  async health() {
    return this.aiEngineService.getHealth();
  }

  @Post('store-incident')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Store incident embedding for similarity search' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Incident stored successfully' })
  async storeIncident(@Body() body: { incidentId: string; incidentData: any }) {
    await this.aiEngineService.storeIncidentEmbedding(body.incidentId, body.incidentData);
    return { success: true, message: 'Incident stored successfully' };
  }
}
