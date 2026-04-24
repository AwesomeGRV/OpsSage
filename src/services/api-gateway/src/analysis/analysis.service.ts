import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnalysisService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async analyzeIncident(query: string, services: string[], timeRange: any, userId: string) {
    const aiEngineUrl = this.configService.get<string>('AI_ENGINE_SERVICE_URL', 'http://localhost:3003');
    
    const response = await this.httpService.axiosRef.post(
      `${aiEngineUrl}/api/v1/ai-engine/analyze`,
      {
        query,
        services,
        timeRange,
        userId,
      },
    );
    
    return response.data;
  }

  async getSimilarIncidents(incidentId: string, query: { limit?: number; minSimilarity?: number }) {
    const incidentAnalysisUrl = this.configService.get<string>('INCIDENT_ANALYSIS_SERVICE_URL', 'http://localhost:3001');
    
    const response = await this.httpService.axiosRef.get(
      `${incidentAnalysisUrl}/api/v1/incidents/${incidentId}/similar`,
      { params: query },
    );
    
    return response.data;
  }
}
