import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIApi } from 'openai';
import { PineconeClient } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';

export interface AnalysisRequest {
  query: string;
  services: string[];
  timeRange: { start: Date; end: Date };
  context?: any;
  userId?: string;
}

export interface AnalysisResult {
  id: string;
  query: string;
  analysis: {
    rootCause: {
      hypothesis: string;
      confidence: number;
      evidence: Array<{
        type: string;
        description: string;
        source: string;
        confidence: number;
        data: any;
      }>;
      contributingFactors: Array<{
        factor: string;
        impact: string;
        description: string;
      }>;
    };
    similarIncidents: Array<{
      id: string;
      title: string;
      similarity: number;
      breakdown: {
        semantic: number;
        structural: number;
        temporal: number;
        impact: number;
        resolution: number;
      };
      metadata: {
        title: string;
        timestamp: string;
        service: string;
        severity: string;
        rootCause: string;
        resolution: string;
        duration: number;
      };
      snippet: string;
      explanation: string;
    }>;
    recommendations: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      priority: string;
      autoExecutable: boolean;
      command?: string;
      runbookId?: string;
      estimatedTime: number;
      riskLevel: string;
      confidence: number;
      reasoning: string;
    }>;
    timeline: Array<{
      timestamp: string;
      type: string;
      title: string;
      description: string;
      severity: string;
    }>;
  };
  metadata: {
    analysisDuration: number;
    dataPointsAnalyzed: number;
    modelVersion: string;
    processingTime: number;
    confidence: number;
    sources: string[];
  };
}

@Injectable()
export class AIEngineService {
  private readonly logger = new Logger(AIEngineService.name);
  private openai: OpenAIApi;
  private pinecone: PineconeClient;
  private pineconeIndex: any;

  constructor(private readonly configService: ConfigService) {
    this.initializeClients();
  }

  private async initializeClients() {
    // Initialize OpenAI
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (openaiApiKey) {
      this.openai = new OpenAIApi({
        apiKey: openaiApiKey,
      });
    }

    // Initialize Pinecone
    const pineconeApiKey = this.configService.get<string>('PINECONE_API_KEY');
    const pineconeEnvironment = this.configService.get<string>('PINECONE_ENVIRONMENT');
    const pineconeIndexName = this.configService.get<string>('PINECONE_INDEX', 'opssage-incidents');

    if (pineconeApiKey && pineconeEnvironment) {
      this.pinecone = new PineconeClient();
      await this.pinecone.init({
        apiKey: pineconeApiKey,
        environment: pineconeEnvironment,
      });
      this.pineconeIndex = this.pinecone.Index(pineconeIndexName);
    }
  }

  async analyzeIncident(request: AnalysisRequest): Promise<AnalysisResult> {
    const startTime = Date.now();
    const analysisId = uuidv4();

    this.logger.log(`Starting incident analysis for query: ${request.query}`);

    try {
      // Step 1: Query preprocessing
      const processedQuery = await this.preprocessQuery(request.query);

      // Step 2: Data collection (simulated - in real implementation, would call data collection service)
      const collectedData = await this.collectRelevantData(request);

      // Step 3: Vector search for similar incidents
      const similarIncidents = await this.findSimilarIncidents(processedQuery, collectedData);

      // Step 4: Context assembly
      const context = await this.assembleContext(processedQuery, collectedData, similarIncidents);

      // Step 5: LLM generation
      const analysis = await this.generateAnalysis(processedQuery, context, similarIncidents);

      // Step 6: Response post-processing
      const result = await this.postProcessResponse(analysisId, request.query, analysis);

      const duration = Date.now() - startTime;
      result.metadata.analysisDuration = duration;

      this.logger.log(`Analysis completed in ${duration}ms with confidence ${result.metadata.confidence}%`);

      return result;
    } catch (error) {
      this.logger.error('Incident analysis failed', error);
      throw error;
    }
  }

  private async preprocessQuery(query: string): Promise<string> {
    // Clean and normalize the query
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  private async collectRelevantData(request: AnalysisRequest): Promise<any> {
    // In a real implementation, this would call the data collection service
    // For now, return mock data
    return {
      logs: [
        {
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          level: 'error',
          message: 'Connection timeout after 30s',
          service: 'checkout-service',
          source: 'datadog',
        },
        {
          timestamp: new Date(Date.now() - 8 * 60 * 1000),
          level: 'error',
          message: 'Database connection pool exhausted',
          service: 'checkout-service',
          source: 'datadog',
        },
      ],
      metrics: [
        {
          name: 'checkout_service.db_connections',
          value: 95,
          expected: 50,
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          source: 'datadog',
        },
        {
          name: 'checkout_service.error_rate',
          value: 0.12,
          expected: 0.02,
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          source: 'datadog',
        },
      ],
      events: [
        {
          type: 'deployment',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          service: 'checkout-service',
          version: 'v2.3.1',
          source: 'kubernetes',
        },
      ],
    };
  }

  private async findSimilarIncidents(query: string, data: any): Promise<any[]> {
    if (!this.pineconeIndex) {
      // Return mock similar incidents if Pinecone is not configured
      return this.getMockSimilarIncidents();
    }

    try {
      // Create embedding for the query
      const embedding = await this.createEmbedding(query);

      // Search for similar incidents in Pinecone
      const searchResponse = await this.pineconeIndex.query({
        vector: embedding,
        topK: 5,
        includeMetadata: true,
      });

      return searchResponse.matches?.map(match => ({
        id: match.id,
        title: match.metadata?.title,
        similarity: Math.round(match.score * 100),
        breakdown: match.metadata?.breakdown || {},
        metadata: match.metadata?.metadata || {},
        snippet: match.metadata?.snippet || '',
        explanation: match.metadata?.explanation || '',
      })) || [];
    } catch (error) {
      this.logger.error('Failed to search similar incidents', error);
      return this.getMockSimilarIncidents();
    }
  }

  private async createEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error('Failed to create embedding', error);
      throw error;
    }
  }

  private async assembleContext(query: string, data: any, similarIncidents: any[]): Promise<string> {
    const contextParts = [
      `Query: ${query}`,
      `Recent Logs: ${data.logs.map(log => `${log.timestamp}: ${log.message}`).join('\n')}`,
      `Metrics: ${data.metrics.map(metric => `${metric.name}: ${metric.value} (expected: ${metric.expected})`).join('\n')}`,
      `Events: ${data.events.map(event => `${event.timestamp}: ${event.type} - ${event.service} ${event.version || ''}`).join('\n')}`,
    ];

    if (similarIncidents.length > 0) {
      contextParts.push(`Similar Incidents: ${similarIncidents.map(inc => inc.title).join(', ')}`);
    }

    return contextParts.join('\n\n');
  }

  private async generateAnalysis(query: string, context: string, similarIncidents: any[]): Promise<any> {
    if (!this.openai) {
      return this.generateMockAnalysis(query, similarIncidents);
    }

    try {
      const prompt = this.buildAnalysisPrompt(query, context, similarIncidents);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const analysisText = response.choices[0].message.content;
      return JSON.parse(analysisText);
    } catch (error) {
      this.logger.error('Failed to generate analysis with OpenAI', error);
      return this.generateMockAnalysis(query, similarIncidents);
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert SRE and DevOps AI assistant specializing in incident analysis and root cause detection.

Your task is to analyze incident data and provide comprehensive analysis including:
1. Root cause hypothesis with confidence score (0-100)
2. Evidence supporting the hypothesis with confidence scores
3. Contributing factors
4. Similar incidents from historical data
5. Actionable recommendations with risk assessment
6. Incident timeline

Always respond in valid JSON format with the following structure:
{
  "rootCause": {
    "hypothesis": "clear statement of likely root cause",
    "confidence": 85,
    "evidence": [
      {
        "type": "log_pattern|metric_anomaly|deployment|configuration",
        "description": "description of evidence",
        "source": "datadog|kubernetes|git|etc",
        "confidence": 90,
        "data": {}
      }
    ],
    "contributingFactors": [
      {
        "factor": "contributing factor description",
        "impact": "high|medium|low",
        "description": "detailed explanation"
      }
    ]
  },
  "recommendations": [
    {
      "id": "unique_id",
      "type": "immediate_action|runbook|investigation",
      "title": "recommendation title",
      "description": "detailed description",
      "priority": "high|medium|low",
      "autoExecutable": true|false,
      "command": "shell command if applicable",
      "runbookId": "runbook_id if applicable",
      "estimatedTime": 5,
      "riskLevel": "low|medium|high",
      "confidence": 90,
      "reasoning": "why this recommendation"
    }
  ],
  "timeline": [
    {
      "timestamp": "ISO timestamp",
      "type": "deployment|alert_triggered|metric_anomaly|user_action",
      "title": "event title",
      "description": "event description",
      "severity": "info|warning|critical"
    }
  ]
}`;
  }

  private buildAnalysisPrompt(query: string, context: string, similarIncidents: any[]): string {
    return `Analyze the following incident and provide a comprehensive root cause analysis:

Query: ${query}

Context:
${context}

Similar Incidents:
${similarIncidents.map(inc => `- ${inc.title} (${inc.similarity}% similar): ${inc.explanation}`).join('\n')}

Please provide a detailed analysis following the system prompt structure. Focus on:
1. Identifying the most likely root cause
2. Providing evidence from logs, metrics, and events
3. Suggesting actionable recommendations
4. Creating a chronological timeline`;
  }

  private generateMockAnalysis(query: string, similarIncidents: any[]): any {
    return {
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
          {
            type: 'metric_anomaly',
            description: 'Database connection utilization at 95%',
            source: 'datadog',
            confidence: 85,
            data: {
              metric: 'checkout_service.db_connections',
              expectedValue: 50,
              actualValue: 95,
              deviation: 90,
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
  }

  private getMockSimilarIncidents(): any[] {
    return [
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
    ];
  }

  private async postProcessResponse(analysisId: string, query: string, analysis: any): Promise<AnalysisResult> {
    return {
      id: analysisId,
      query,
      analysis: {
        ...analysis,
        similarIncidents: analysis.similarIncidents || [],
      },
      metadata: {
        analysisDuration: 0, // Will be set by caller
        dataPointsAnalyzed: 15420,
        modelVersion: 'gpt-4-1106',
        processingTime: 0,
        confidence: analysis.rootCause?.confidence || 75,
        sources: ['datadog_logs', 'datadog_metrics', 'kubernetes_events', 'vector_database'],
      },
    };
  }

  async storeIncidentEmbedding(incidentId: string, incidentData: any): Promise<void> {
    if (!this.pineconeIndex) {
      this.logger.warn('Pinecone not configured, skipping incident storage');
      return;
    }

    try {
      const text = this.createIncidentText(incidentData);
      const embedding = await this.createEmbedding(text);

      await this.pineconeIndex.upsert({
        vectors: [
          {
            id: incidentId,
            values: embedding,
            metadata: {
              title: incidentData.title,
              snippet: text.substring(0, 500),
              explanation: `Incident from ${incidentData.timestamp}`,
              breakdown: {
                semantic: 100,
                structural: 100,
                temporal: 100,
                impact: 100,
                resolution: 100,
              },
              metadata: {
                title: incidentData.title,
                timestamp: incidentData.timestamp,
                service: incidentData.service,
                severity: incidentData.severity,
                rootCause: incidentData.rootCause,
                resolution: incidentData.resolution,
                duration: incidentData.duration || 0,
              },
            },
          },
        ],
      });

      this.logger.log(`Stored embedding for incident ${incidentId}`);
    } catch (error) {
      this.logger.error(`Failed to store embedding for incident ${incidentId}`, error);
    }
  }

  private createIncidentText(incidentData: any): string {
    return `${incidentData.title} ${incidentData.description} ${incidentData.service} ${incidentData.severity} ${incidentData.rootCause} ${incidentData.resolution}`;
  }

  async getHealth(): Promise<any> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        openai: !!this.openai,
        pinecone: !!this.pineconeIndex,
      },
      model: 'gpt-4-1106',
      version: '1.0.0',
    };
  }
}
