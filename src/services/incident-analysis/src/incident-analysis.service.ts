import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from './entities/incident.entity';

export interface CreateIncidentDto {
  title: string;
  description?: string;
  service: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
}

export interface UpdateIncidentDto {
  title?: string;
  description?: string;
  status?: string;
  severity?: string;
  assignee?: string;
  resolution?: string;
  rootCause?: string;
}

export interface AnalyzeIncidentDto {
  query: string;
  services: string[];
  timeRange: {
    start: string;
    end: string;
  };
}

export interface IncidentResponseDto {
  id: string;
  title: string;
  description?: string;
  status: string;
  severity: string;
  service?: string;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  duration?: number;
  analysis?: any;
}

export interface AnalysisResponseDto {
  id: string;
  query: string;
  analysis: any;
  metadata: any;
}

@Injectable()
export class IncidentAnalysisService {
  private readonly logger = new Logger(IncidentAnalysisService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
  ) {}

  async create(createIncidentDto: CreateIncidentDto, userId: string): Promise<IncidentResponseDto> {
    this.logger.log(`Creating incident: ${createIncidentDto.title}`);

    const incident = this.incidentRepository.create({
      ...createIncidentDto,
      status: 'open',
      assignee: userId,
      metadata: {
        createdBy: userId,
        source: 'manual',
      },
    });

    const savedIncident = await this.incidentRepository.save(incident);

    return this.mapToResponseDto(savedIncident);
  }

  async findAll(query: any): Promise<{ incidents: IncidentResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, severity, service, assignedTo } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.incidentRepository.createQueryBuilder('incident');

    if (status) {
      queryBuilder.andWhere('incident.status = :status', { status });
    }
    if (severity) {
      queryBuilder.andWhere('incident.severity = :severity', { severity });
    }
    if (service) {
      queryBuilder.andWhere('incident.service = :service', { service });
    }
    if (assignedTo) {
      queryBuilder.andWhere('incident.assignee = :assignedTo', { assignedTo });
    }

    const [incidents, total] = await queryBuilder
      .orderBy('incident.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      incidents: incidents.map(incident => this.mapToResponseDto(incident)),
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findOne(id: string): Promise<IncidentResponseDto> {
    const incident = await this.incidentRepository.findOne({ where: { id } });
    
    if (!incident) {
      throw new Error(`Incident with ID ${id} not found`);
    }

    return this.mapToResponseDto(incident);
  }

  async update(id: string, updateIncidentDto: UpdateIncidentDto, userId: string): Promise<IncidentResponseDto> {
    this.logger.log(`Updating incident ${id}`);

    const incident = await this.incidentRepository.findOne({ where: { id } });
    
    if (!incident) {
      throw new Error(`Incident with ID ${id} not found`);
    }

    // If resolving the incident, calculate duration and set resolvedAt
    if (updateIncidentDto.status === 'resolved' && incident.status !== 'resolved') {
      updateIncidentDto['resolvedAt'] = new Date();
      updateIncidentDto['duration'] = Math.floor((Date.now() - incident.createdAt.getTime()) / 1000 / 60); // in minutes
    }

    Object.assign(incident, updateIncidentDto);
    incident.metadata = {
      ...incident.metadata,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    const updatedIncident = await this.incidentRepository.save(incident);

    return this.mapToResponseDto(updatedIncident);
  }

  async remove(id: string): Promise<void> {
    const incident = await this.incidentRepository.findOne({ where: { id } });
    
    if (!incident) {
      throw new Error(`Incident with ID ${id} not found`);
    }

    await this.incidentRepository.remove(incident);
    this.logger.log(`Incident ${id} deleted`);
  }

  async assign(id: string, userId: string, currentUserId: string): Promise<IncidentResponseDto> {
    return this.update(id, { assignee: userId }, currentUserId);
  }

  async resolve(id: string, resolution: string, rootCause?: string, userId?: string): Promise<IncidentResponseDto> {
    const updateData: UpdateIncidentDto = {
      status: 'resolved',
      resolution,
    };

    if (rootCause) {
      updateData.rootCause = rootCause;
    }

    return this.update(id, updateData, userId || 'system');
  }

  async analyze(analyzeIncidentDto: AnalyzeIncidentDto, userId: string): Promise<AnalysisResponseDto> {
    this.logger.log(`Analyzing incident: ${analyzeIncidentDto.query}`);

    // In a real implementation, this would call the AI Engine service
    // For now, return mock analysis
    const mockAnalysis = {
      rootCause: {
        hypothesis: 'Database connection pool exhaustion in checkout-service',
        confidence: 82,
        evidence: [
          {
            type: 'log_pattern',
            description: 'High frequency of connection timeout errors',
            source: 'datadog',
            confidence: 90,
            data: {
              pattern: 'Connection timeout after 30s',
              count: 347,
            },
          },
        ],
        contributingFactors: [
          {
            factor: 'Recent deployment with potential connection leak',
            impact: 'high',
            description: 'New version may have introduced connection pool leak',
          },
        ],
      },
      similarIncidents: [
        {
          id: 'inc_987654321',
          title: 'Checkout service database connection issues',
          similarity: 91,
          breakdown: {
            semantic: 94,
            structural: 88,
            temporal: 85,
            impact: 92,
            resolution: 89,
          },
          metadata: {
            title: 'Checkout service database connection exhaustion',
            timestamp: '2024-01-01T14:30:00Z',
            service: 'checkout-service',
            severity: 'high',
            rootCause: 'Database connection pool exhaustion',
            resolution: 'Increased connection pool size and restarted service',
            duration: 45,
          },
          snippet: 'Database connection timeout errors in checkout-service...',
          explanation: 'Similar incident 14 days ago. Root cause: memory leak in service X. Confidence: 91%',
        },
      ],
      recommendations: [
        {
          id: 'rec_001',
          type: 'immediate_action',
          title: 'Restart checkout-service',
          description: 'Immediate restart to clear connection pool and restore service',
          priority: 'high',
          autoExecutable: true,
          command: 'kubectl rollout restart deployment/checkout-service',
          estimatedTime: 5,
          riskLevel: 'low',
          confidence: 90,
          reasoning: 'Service restart will clear connection pool and is low risk',
        },
      ],
      timeline: [
        {
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          type: 'deployment',
          title: 'New version deployed',
          description: 'Checkout-service v2.3.1 deployed to production',
          severity: 'info',
        },
        {
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          type: 'alert_triggered',
          title: 'High error rate detected',
          description: 'Error rate exceeded 5% threshold in checkout-service',
          severity: 'warning',
        },
      ],
    };

    return {
      id: `analysis_${Date.now()}`,
      query: analyzeIncidentDto.query,
      analysis: mockAnalysis,
      metadata: {
        analysisDuration: 23.5,
        dataPointsAnalyzed: 15420,
        modelVersion: 'gpt-4-1106',
        processingTime: 23.5,
        confidence: 82,
        sources: ['datadog_logs', 'datadog_metrics', 'kubernetes_events', 'vector_database'],
        userId,
      },
    };
  }

  async findSimilar(id: string, query: { limit?: number; minSimilarity?: number }): Promise<{ incidents: IncidentResponseDto[]; total: number }> {
    const incident = await this.incidentRepository.findOne({ where: { id } });
    
    if (!incident) {
      throw new Error(`Incident with ID ${id} not found`);
    }

    const limit = query.limit || 5;
    const minSimilarity = query.minSimilarity || 70;

    // In a real implementation, this would use vector similarity search
    // For now, return mock similar incidents
    const similarIncidents = await this.incidentRepository
      .createQueryBuilder('incident')
      .where('incident.service = :service', { service: incident.service })
      .andWhere('incident.id != :id', { id })
      .andWhere('incident.status = :status', { status: 'resolved' })
      .orderBy('incident.createdAt', 'DESC')
      .limit(limit)
      .getMany();

    return {
      incidents: similarIncidents.map(inc => this.mapToResponseDto(inc)),
      total: similarIncidents.length,
    };
  }

  async getTimeline(id: string): Promise<any[]> {
    const incident = await this.incidentRepository.findOne({ where: { id } });
    
    if (!incident) {
      throw new Error(`Incident with ID ${id} not found`);
    }

    // Build timeline from incident data
    const timeline = [
      {
        timestamp: incident.createdAt.toISOString(),
        type: 'incident_created',
        title: 'Incident Created',
        description: incident.title,
        severity: incident.severity,
      },
    ];

    if (incident.timeline) {
      timeline.push(...incident.timeline);
    }

    if (incident.resolvedAt) {
      timeline.push({
        timestamp: incident.resolvedAt.toISOString(),
        type: 'incident_resolved',
        title: 'Incident Resolved',
        description: incident.resolution || 'Incident was resolved',
        severity: 'info',
      });
    }

    return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async addComment(id: string, comment: string, userId: string): Promise<any> {
    const incident = await this.incidentRepository.findOne({ where: { id } });
    
    if (!incident) {
      throw new Error(`Incident with ID ${id} not found`);
    }

    const newComment = {
      id: `comment_${Date.now()}`,
      text: comment,
      userId,
      timestamp: new Date().toISOString(),
    };

    // Add comment to metadata
    const comments = incident.metadata?.comments || [];
    comments.push(newComment);

    incident.metadata = {
      ...incident.metadata,
      comments,
    };

    await this.incidentRepository.save(incident);

    return newComment;
  }

  async getStats(timeRange?: string): Promise<any> {
    const timeFilter = this.getTimeFilter(timeRange);

    const queryBuilder = this.incidentRepository.createQueryBuilder('incident');

    if (timeFilter) {
      queryBuilder.andWhere('incident.createdAt >= :timeFilter', { timeFilter });
    }

    const incidents = await queryBuilder.getMany();

    const stats = {
      total: incidents.length,
      byStatus: {
        open: incidents.filter(inc => inc.status === 'open').length,
        investigating: incidents.filter(inc => inc.status === 'investigating').length,
        resolved: incidents.filter(inc => inc.status === 'resolved').length,
        closed: incidents.filter(inc => inc.status === 'closed').length,
      },
      bySeverity: {
        low: incidents.filter(inc => inc.severity === 'low').length,
        medium: incidents.filter(inc => inc.severity === 'medium').length,
        high: incidents.filter(inc => inc.severity === 'high').length,
        critical: incidents.filter(inc => inc.severity === 'critical').length,
      },
      avgResolutionTime: this.calculateAvgResolutionTime(incidents),
      mttr: this.calculateMTTR(incidents),
    };

    return stats;
  }

  private mapToResponseDto(incident: Incident): IncidentResponseDto {
    return {
      id: incident.id,
      title: incident.title,
      description: incident.description,
      status: incident.status,
      severity: incident.severity,
      service: incident.service,
      assignee: incident.assignee,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
      resolvedAt: incident.resolvedAt,
      duration: incident.duration,
      analysis: incident.analysis,
    };
  }

  private getTimeFilter(timeRange?: string): Date | null {
    if (!timeRange) return null;

    const now = new Date();
    switch (timeRange) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  }

  private calculateAvgResolutionTime(incidents: Incident[]): number {
    const resolvedIncidents = incidents.filter(inc => inc.duration);
    if (resolvedIncidents.length === 0) return 0;

    const totalDuration = resolvedIncidents.reduce((sum, inc) => sum + inc.duration, 0);
    return Math.round(totalDuration / resolvedIncidents.length);
  }

  private calculateMTTR(incidents: Incident[]): number {
    const resolvedIncidents = incidents.filter(inc => inc.duration);
    if (resolvedIncidents.length === 0) return 0;

    const totalDuration = resolvedIncidents.reduce((sum, inc) => sum + inc.duration, 0);
    return Math.round(totalDuration / resolvedIncidents.length);
  }
}
