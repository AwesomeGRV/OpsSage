import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataCollectionService, CollectionResult } from './data-collection.service';

@ApiTags('data-collection')
@Controller('data-collection')
export class DataCollectionController {
  constructor(private readonly dataCollectionService: DataCollectionService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get data collection service status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Collection status retrieved successfully' })
  async getStatus() {
    return this.dataCollectionService.getCollectionStatus();
  }

  @Post('collect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger on-demand data collection' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Collection completed successfully' })
  async collectOnDemand(
    @Body() body: { sources: string[]; timeRange: { start: string; end: string } }
  ): Promise<{ results: CollectionResult[]; total: number }> {
    const timeRange = {
      start: new Date(body.timeRange.start),
      end: new Date(body.timeRange.end),
    };
    
    const results = await this.dataCollectionService.collectOnDemand(body.sources, timeRange);
    
    return {
      results,
      total: results.reduce((sum, result) => sum + result.data.length, 0),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for data collection service' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Service is healthy' })
  async health() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'data-collection',
      version: '1.0.0',
    };
  }
}
