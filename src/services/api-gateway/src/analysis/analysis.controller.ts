import { Controller, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze incident using AI' })
  @ApiResponse({ status: 200, description: 'Analysis completed successfully' })
  async analyzeIncident(
    @Body() body: { query: string; services: string[]; timeRange: any },
    @Query('userId') userId: string,
  ) {
    return this.analysisService.analyzeIncident(body.query, body.services, body.timeRange, userId);
  }

  @Get(':id/similar')
  @ApiOperation({ summary: 'Get similar incidents' })
  @ApiResponse({ status: 200, description: 'Similar incidents retrieved successfully' })
  async getSimilarIncidents(
    @Param('id') id: string,
    @Query() query: { limit?: number; minSimilarity?: number },
  ) {
    return this.analysisService.getSimilarIncidents(id, query);
  }
}
