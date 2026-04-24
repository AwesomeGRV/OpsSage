import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RAGService } from './rag.service';

@ApiTags('rag')
@Controller('rag')
export class RAGController {
  constructor(private readonly ragService: RAGService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze incident using RAG pipeline' })
  @ApiResponse({ status: 200, description: 'Analysis completed successfully' })
  async analyzeIncident(@Body() body: { 
    query: string; 
    services: string[]; 
    timeRange: { start: string; end: string };
    userId: string;
  }) {
    const context = {
      userId: body.userId,
      defaultTimeRange: {
        start: new Date(body.timeRange.start),
        end: new Date(body.timeRange.end)
      },
      maxResults: 10,
      services: body.services
    };

    return await this.ragService.analyzeIncident(body.query, context);
  }

  @Post('store-incident')
  @ApiOperation({ summary: 'Store incident embedding' })
  @ApiResponse({ status: 200, description: 'Incident stored successfully' })
  async storeIncident(@Body() body: { 
    id: string; 
    title: string; 
    description: string; 
    service: string; 
    severity: string;
  }) {
    await this.ragService.storeIncidentEmbedding(body);
    return { success: true, message: 'Incident embedding stored successfully' };
  }

  @Get('health')
  @ApiOperation({ summary: 'RAG service health check' })
  @ApiResponse({ status: 200, description: 'RAG service is healthy' })
  async health() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'rag-pipeline',
      version: '1.0.0'
    };
  }
}
