import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreateIncidentDto, UpdateIncidentDto, AnalyzeIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createIncidentDto: CreateIncidentDto, userId: string) {
    const incidentAnalysisUrl = this.configService.get<string>('INCIDENT_ANALYSIS_SERVICE_URL', 'http://localhost:3001');
    
    const response = await this.httpService.axiosRef.post(
      `${incidentAnalysisUrl}/api/v1/incidents`,
      createIncidentDto,
      {
        headers: {
          'X-User-ID': userId,
        },
      },
    );
    
    return response.data;
  }

  async findAll(query: any) {
    const incidentAnalysisUrl = this.configService.get<string>('INCIDENT_ANALYSIS_SERVICE_URL', 'http://localhost:3001');
    
    const response = await this.httpService.axiosRef.get(
      `${incidentAnalysisUrl}/api/v1/incidents`,
      { params: query },
    );
    
    return response.data;
  }

  async findOne(id: string) {
    const incidentAnalysisUrl = this.configService.get<string>('INCIDENT_ANALYSIS_SERVICE_URL', 'http://localhost:3001');
    
    const response = await this.httpService.axiosRef.get(
      `${incidentAnalysisUrl}/api/v1/incidents/${id}`,
    );
    
    return response.data;
  }

  async update(id: string, updateIncidentDto: UpdateIncidentDto, userId: string) {
    const incidentAnalysisUrl = this.configService.get<string>('INCIDENT_ANALYSIS_SERVICE_URL', 'http://localhost:3001');
    
    const response = await this.httpService.axiosRef.put(
      `${incidentAnalysisUrl}/api/v1/incidents/${id}`,
      updateIncidentDto,
      {
        headers: {
          'X-User-ID': userId,
        },
      },
    );
    
    return response.data;
  }

  async remove(id: string) {
    const incidentAnalysisUrl = this.configService.get<string>('INCIDENT_ANALYSIS_SERVICE_URL', 'http://localhost:3001');
    
    await this.httpService.axiosRef.delete(
      `${incidentAnalysisUrl}/api/v1/incidents/${id}`,
    );
  }

  async assign(id: string, userId: string, currentUserId: string) {
    const incidentAnalysisUrl = this.configService.get<string>('INCIDENT_ANALYSIS_SERVICE_URL', 'http://localhost:3001');
    
    const response = await this.httpService.axiosRef.post(
      `${incidentAnalysisUrl}/api/v1/incidents/${id}/assign`,
      { userId },
      {
        headers: {
          'X-User-ID': currentUserId,
        },
      },
    );
    
    return response.data;
  }

  async resolve(id: string, resolution: string, rootCause: string, userId: string) {
    const incidentAnalysisUrl = this.configService.get<string>('INCIDENT_ANALYSIS_SERVICE_URL', 'http://localhost:3001');
    
    const response = await this.httpService.axiosRef.post(
      `${incidentAnalysisUrl}/api/v1/incidents/${id}/resolve`,
      { resolution, rootCause },
      {
        headers: {
          'X-User-ID': userId,
        },
      },
    );
    
    return response.data;
  }

  async analyze(analyzeIncidentDto: AnalyzeIncidentDto, userId: string) {
    const aiEngineUrl = this.configService.get<string>('AI_ENGINE_SERVICE_URL', 'http://localhost:3003');
    
    const response = await this.httpService.axiosRef.post(
      `${aiEngineUrl}/api/v1/ai-engine/analyze`,
      {
        ...analyzeIncidentDto,
        userId,
      },
    );
    
    return response.data;
  }

  async findSimilar(id: string, query: { limit?: number; minSimilarity?: number }) {
    const incidentAnalysisUrl = this.configService.get<string>('INCIDENT_ANALYSIS_SERVICE_URL', 'http://localhost:3001');
    
    const response = await this.httpService.axiosRef.get(
      `${incidentAnalysisUrl}/api/v1/incidents/${id}/similar`,
      { params: query },
    );
    
    return response.data;
  }

  async getTimeline(id: string) {
    const incidentAnalysisUrl = this.configService.get<string>('INCIDENT_ANALYSIS_SERVICE_URL', 'http://localhost:3001');
    
    const response = await this.httpService.axiosRef.get(
      `${incidentAnalysisUrl}/api/v1/incidents/${id}/timeline`,
    );
    
    return response.data;
  }

  async addComment(id: string, comment: string, userId: string) {
    const incidentAnalysisUrl = this.configService.get<string>('INCIDENT_ANALYSIS_SERVICE_URL', 'http://localhost:3001');
    
    const response = await this.httpService.axiosRef.post(
      `${incidentAnalysisUrl}/api/v1/incidents/${id}/comments`,
      { comment },
      {
        headers: {
          'X-User-ID': userId,
        },
      },
    );
    
    return response.data;
  }

  async getStats(timeRange?: string) {
    const incidentAnalysisUrl = this.configService.get<string>('INCIDENT_ANALYSIS_SERVICE_URL', 'http://localhost:3001');
    
    const response = await this.httpService.axiosRef.get(
      `${incidentAnalysisUrl}/api/v1/incidents/stats/summary`,
      { params: { timeRange } },
    );
    
    return response.data;
  }
}
