import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { IncidentAnalysisService, CreateIncidentDto, UpdateIncidentDto, AnalyzeIncidentDto } from './incident-analysis.service';

@ApiTags('incidents')
@Controller('incidents')
@UseGuards(JwtAuthGuard, ApiKeyGuard)
export class IncidentAnalysisController {
  constructor(private readonly incidentAnalysisService: IncidentAnalysisService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new incident' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Incident created successfully' })
  async createIncident(
    @Body() createIncidentDto: CreateIncidentDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.incidentAnalysisService.create(createIncidentDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all incidents with optional filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'investigating', 'resolved', 'closed'] })
  @ApiQuery({ name: 'severity', required: false, enum: ['low', 'medium', 'high', 'critical'] })
  @ApiQuery({ name: 'service', required: false, type: String })
  @ApiQuery({ name: 'assignedTo', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Incidents retrieved successfully' })
  async getIncidents(@Query() query: any) {
    return this.incidentAnalysisService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident by ID' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Incident retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Incident not found' })
  async getIncident(@Param('id') id: string) {
    return this.incidentAnalysisService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update incident' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Incident updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Incident not found' })
  async updateIncident(
    @Param('id') id: string,
    @Body() updateIncidentDto: UpdateIncidentDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.incidentAnalysisService.update(id, updateIncidentDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete incident' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Incident deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Incident not found' })
  async deleteIncident(@Param('id') id: string) {
    return this.incidentAnalysisService.remove(id);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign incident to user' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Incident assigned successfully' })
  async assignIncident(
    @Param('id') id: string,
    @Body() body: { userId: string },
    @Request() req: any,
  ) {
    const currentUserId = req.user?.sub || req.user?.id;
    return this.incidentAnalysisService.assign(id, body.userId, currentUserId);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve incident' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Incident resolved successfully' })
  async resolveIncident(
    @Param('id') id: string,
    @Body() body: { resolution: string; rootCause?: string },
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.incidentAnalysisService.resolve(id, body.resolution, body.rootCause, userId);
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze incident using AI' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Incident analyzed successfully' })
  async analyzeIncident(
    @Body() analyzeIncidentDto: AnalyzeIncidentDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.incidentAnalysisService.analyze(analyzeIncidentDto, userId);
  }

  @Get(':id/similar')
  @ApiOperation({ summary: 'Find similar incidents' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'minSimilarity', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Similar incidents found' })
  async findSimilarIncidents(
    @Param('id') id: string,
    @Query() query: { limit?: number; minSimilarity?: number },
  ) {
    return this.incidentAnalysisService.findSimilar(id, query);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get incident timeline' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Timeline retrieved successfully' })
  async getIncidentTimeline(@Param('id') id: string) {
    return this.incidentAnalysisService.getTimeline(id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to incident' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Comment added successfully' })
  async addComment(
    @Param('id') id: string,
    @Body() body: { comment: string },
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.incidentAnalysisService.addComment(id, body.comment, userId);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get incident statistics summary' })
  @ApiQuery({ name: 'timeRange', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statistics retrieved successfully' })
  async getIncidentStats(@Query() query: { timeRange?: string }) {
    return this.incidentAnalysisService.getStats(query.timeRange);
  }
}
