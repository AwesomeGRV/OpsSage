import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { AnalyzeIncidentDto } from './dto/analyze-incident.dto';
import { IncidentResponseDto } from './dto/incident-response.dto';
import { AnalysisResponseDto } from './dto/analysis-response.dto';

@ApiTags('incidents')
@Controller('incidents')
@UseGuards(JwtAuthGuard, ApiKeyGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new incident' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Incident created successfully', type: IncidentResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async createIncident(
    @Body() createIncidentDto: CreateIncidentDto,
    @Request() req: any,
  ): Promise<IncidentResponseDto> {
    const userId = req.user?.sub || req.user?.id;
    return this.incidentsService.create(createIncidentDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all incidents with optional filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'investigating', 'resolved', 'closed'], description: 'Incident status' })
  @ApiQuery({ name: 'severity', required: false, enum: ['low', 'medium', 'high', 'critical'], description: 'Incident severity' })
  @ApiQuery({ name: 'service', required: false, type: String, description: 'Service name' })
  @ApiQuery({ name: 'assignedTo', required: false, type: String, description: 'Assigned user ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Incidents retrieved successfully', type: [IncidentResponseDto] })
  async getIncidents(@Query() query: any): Promise<{ incidents: IncidentResponseDto[]; total: number; page: number; limit: number }> {
    return this.incidentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident by ID' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Incident retrieved successfully', type: IncidentResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Incident not found' })
  async getIncident(@Param('id') id: string): Promise<IncidentResponseDto> {
    return this.incidentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update incident' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Incident updated successfully', type: IncidentResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Incident not found' })
  async updateIncident(
    @Param('id') id: string,
    @Body() updateIncidentDto: UpdateIncidentDto,
    @Request() req: any,
  ): Promise<IncidentResponseDto> {
    const userId = req.user?.sub || req.user?.id;
    return this.incidentsService.update(id, updateIncidentDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete incident' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Incident deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Incident not found' })
  async deleteIncident(@Param('id') id: string): Promise<void> {
    return this.incidentsService.remove(id);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign incident to user' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Incident assigned successfully', type: IncidentResponseDto })
  async assignIncident(
    @Param('id') id: string,
    @Body() body: { userId: string },
    @Request() req: any,
  ): Promise<IncidentResponseDto> {
    const currentUserId = req.user?.sub || req.user?.id;
    return this.incidentsService.assign(id, body.userId, currentUserId);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve incident' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Incident resolved successfully', type: IncidentResponseDto })
  async resolveIncident(
    @Param('id') id: string,
    @Body() body: { resolution: string; rootCause?: string },
    @Request() req: any,
  ): Promise<IncidentResponseDto> {
    const userId = req.user?.sub || req.user?.id;
    return this.incidentsService.resolve(id, body.resolution, body.rootCause, userId);
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze incident using AI' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Incident analyzed successfully', type: AnalysisResponseDto })
  async analyzeIncident(
    @Body() analyzeIncidentDto: AnalyzeIncidentDto,
    @Request() req: any,
  ): Promise<AnalysisResponseDto> {
    const userId = req.user?.sub || req.user?.id;
    return this.incidentsService.analyze(analyzeIncidentDto, userId);
  }

  @Get(':id/similar')
  @ApiOperation({ summary: 'Find similar incidents' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of similar incidents' })
  @ApiQuery({ name: 'minSimilarity', required: false, type: Number, description: 'Minimum similarity score (0-100)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Similar incidents found' })
  async findSimilarIncidents(
    @Param('id') id: string,
    @Query() query: { limit?: number; minSimilarity?: number },
  ): Promise<{ incidents: IncidentResponseDto[]; total: number }> {
    return this.incidentsService.findSimilar(id, query);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get incident timeline' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Timeline retrieved successfully' })
  async getIncidentTimeline(@Param('id') id: string): Promise<any> {
    return this.incidentsService.getTimeline(id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to incident' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Comment added successfully' })
  async addComment(
    @Param('id') id: string,
    @Body() body: { comment: string },
    @Request() req: any,
  ): Promise<any> {
    const userId = req.user?.sub || req.user?.id;
    return this.incidentsService.addComment(id, body.comment, userId);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get incident statistics summary' })
  @ApiQuery({ name: 'timeRange', required: false, type: String, description: 'Time range (e.g., 24h, 7d, 30d)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statistics retrieved successfully' })
  async getIncidentStats(@Query() query: { timeRange?: string }): Promise<any> {
    return this.incidentsService.getStats(query.timeRange);
  }
}
