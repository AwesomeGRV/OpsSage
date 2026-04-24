import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { Redis } from 'ioredis';

export interface ProcessedQuery {
  original: string;
  embedding: number[];
  entities: QueryEntity[];
  intents: QueryIntent[];
  filters: SearchFilters;
  context: QueryContext;
}

export interface QueryEntity {
  type: 'service' | 'time' | 'error';
  value: string;
  confidence: number;
}

export interface QueryIntent {
  type: 'root_cause' | 'similar_incidents' | 'status_check';
  confidence: number;
}

export interface SearchFilters {
  service?: string[];
  severity?: string[];
  timeRange?: TimeRange;
  topK?: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface QueryContext {
  userId: string;
  defaultTimeRange: TimeRange;
  maxResults: number;
  severity?: string[];
  services?: string[];
}

export interface DataChunk {
  id: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
  source: string;
}

export interface EmbeddedChunk extends DataChunk {
  embedding: number[];
  embeddingModel: string;
  embeddingDimension: number;
}

export interface SimilarChunk {
  id: string;
  score: number;
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface SearchResult {
  query: ProcessedQuery;
  results: SimilarChunk[];
  totalFound: number;
  searchTime: number;
}

export interface GenerationContext {
  query: string;
  entities: QueryEntity[];
  intents: QueryIntent[];
  relevantData: {
    logs?: SimilarChunk[];
    metrics?: SimilarChunk[];
    incidents?: SimilarChunk[];
    events?: SimilarChunk[];
  };
  summary: string;
  timeRange?: TimeRange;
  services: string[];
}

export interface LLMResponse {
  rootCause: {
    hypothesis: string;
    confidence: number;
    evidence: Array<{
      type: string;
      description: string;
      source: string;
      confidence: number;
    }>;
  };
  similarIncidents: Array<{
    id: string;
    title: string;
    similarity: number;
    explanation: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
    autoExecutable: boolean;
    command?: string;
  }>;
}

@Injectable()
export class RAGService {
  private readonly logger = new Logger(RAGService.name);
  private readonly openai: OpenAI;
  private readonly pinecone: Pinecone;
  private readonly redis: Redis;
  private readonly indexName: string;
  private readonly EMBEDDING_MODEL = 'text-embedding-ada-002';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY', ''),
    });
    
    this.pinecone = new Pinecone({
      apiKey: this.configService.get('PINECONE_API_KEY', ''),
    });
    
    this.redis = new Redis(this.configService.get('REDIS_URL', 'redis://localhost:6379'));
    this.indexName = this.configService.get('PINECONE_INDEX', 'opssage-incidents');
  }

  async analyzeIncident(query: string, context: QueryContext): Promise<LLMResponse> {
    try {
      this.logger.log(`Starting incident analysis for query: ${query}`);
      
      // Step 1: Process query
      const processedQuery = await this.processQuery(query, context);
      
      // Step 2: Search for relevant data
      const searchResult = await this.search(processedQuery);
      
      // Step 3: Assemble context
      const generationContext = await this.assembleContext(searchResult, processedQuery);
      
      // Step 4: Generate analysis
      const analysis = await this.generateAnalysis(generationContext);
      
      this.logger.log(`Incident analysis completed successfully`);
      return analysis;
      
    } catch (error) {
      this.logger.error('Error in incident analysis', error);
      throw new Error('Failed to analyze incident');
    }
  }

  async processQuery(query: string, context: QueryContext): Promise<ProcessedQuery> {
    this.logger.log(`Processing query: ${query}`);
    
    // Extract entities and intents
    const entities = this.extractEntities(query);
    const intents = this.detectIntents(query);
    
    // Generate query embedding
    const embedding = await this.generateEmbedding(query);
    
    // Build filters based on context
    const filters = this.buildFilters(context, entities);
    
    return {
      original: query,
      embedding,
      entities,
      intents,
      filters,
      context
    };
  }

  private extractEntities(query: string): QueryEntity[] {
    const entities: QueryEntity[] = [];
    
    // Service names
    const servicePattern = /\b(checkout-service|payment-service|user-service|api-gateway)\b/gi;
    const services = query.match(servicePattern) || [];
    entities.push(...services.map(service => ({
      type: 'service' as const,
      value: service.toLowerCase(),
      confidence: 0.9
    })));
    
    // Time expressions
    const timePattern = /\b(last \d+ (hours|minutes|days)|today|yesterday)\b/gi;
    const times = query.match(timePattern) || [];
    entities.push(...times.map(time => ({
      type: 'time' as const,
      value: time.toLowerCase(),
      confidence: 0.8
    })));
    
    // Error types
    const errorPattern = /\b(timeout|error|failure|crash|exception|5\d{2}|4\d{2})\b/gi;
    const errors = query.match(errorPattern) || [];
    entities.push(...errors.map(error => ({
      type: 'error' as const,
      value: error.toLowerCase(),
      confidence: 0.7
    })));
    
    return entities;
  }

  private detectIntents(query: string): QueryIntent[] {
    const intents: QueryIntent[] = [];
    
    // Root cause analysis
    if (/\b(why|cause|reason)\b.*\b(failing|error|problem|issue)\b/i.test(query)) {
      intents.push({ type: 'root_cause', confidence: 0.8 });
    }
    
    // Similar incidents
    if (/\b(similar|like|previous)\b.*\b(incident|issue|problem)\b/i.test(query)) {
      intents.push({ type: 'similar_incidents', confidence: 0.9 });
    }
    
    // Status check
    if (/\b(status|health|state)\b.*\b(service|system)\b/i.test(query)) {
      intents.push({ type: 'status_check', confidence: 0.7 });
    }
    
    return intents;
  }

  private buildFilters(context: QueryContext, entities: QueryEntity[]): SearchFilters {
    const filters: SearchFilters = {};
    
    // Service filters
    const services = entities.filter(e => e.type === 'service').map(e => e.value);
    if (services.length > 0) {
      filters.service = services;
    }
    
    // Time range filters
    const timeEntities = entities.filter(e => e.type === 'time');
    if (timeEntities.length > 0) {
      filters.timeRange = this.parseTimeRange(timeEntities[0].value);
    } else if (context.defaultTimeRange) {
      filters.timeRange = context.defaultTimeRange;
    }
    
    // Severity filters
    if (context.severity) {
      filters.severity = context.severity;
    }
    
    // Top K results
    filters.topK = context.maxResults || 10;
    
    return filters;
  }

  private parseTimeRange(timeExpression: string): TimeRange {
    const now = new Date();
    
    if (timeExpression.includes('last')) {
      const match = timeExpression.match(/last (\d+) (hours|minutes|days)/i);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        
        const start = new Date(now);
        if (unit === 'hours') {
          start.setHours(start.getHours() - value);
        } else if (unit === 'minutes') {
          start.setMinutes(start.getMinutes() - value);
        } else if (unit === 'days') {
          start.setDate(start.getDate() - value);
        }
        
        return { start, end: now };
      }
    }
    
    // Default to last 24 hours
    return {
      start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      end: now
    };
  }

  async search(processedQuery: ProcessedQuery): Promise<SearchResult> {
    try {
      this.logger.log('Starting vector search');
      
      const index = this.pinecone.Index(this.indexName);
      
      const queryRequest = {
        vector: processedQuery.embedding,
        topK: processedQuery.filters.topK || 10,
        includeMetadata: true,
        filter: this.buildPineconeFilter(processedQuery.filters)
      };
      
      const response = await index.query(queryRequest);
      
      const results = (response.matches || []).map((match: any) => ({
        id: match.id || '',
        score: match.score || 0,
        content: String(match.metadata?.content || ''),
        metadata: match.metadata || {},
        timestamp: new Date(String(match.metadata?.timestamp || Date.now()))
      }));
      
      return {
        query: processedQuery,
        results,
        totalFound: results.length,
        searchTime: Date.now()
      };
      
    } catch (error) {
      this.logger.error('Error in vector search', error);
      
      // Return mock data for demo purposes
      return this.getMockSearchResult(processedQuery);
    }
  }

  private buildPineconeFilter(filters: SearchFilters): any {
    const pineconeFilter: any = {};
    
    if (filters.service) {
      pineconeFilter.service = { $in: filters.service };
    }
    
    if (filters.severity) {
      pineconeFilter.severity = { $in: filters.severity };
    }
    
    if (filters.timeRange) {
      pineconeFilter.timestamp = {
        $gte: filters.timeRange.start.toISOString(),
        $lte: filters.timeRange.end.toISOString()
      };
    }
    
    return Object.keys(pineconeFilter).length > 0 ? pineconeFilter : undefined;
  }

  private getMockSearchResult(processedQuery: ProcessedQuery): SearchResult {
    const mockResults: SimilarChunk[] = [
      {
        id: 'mock-1',
        score: 0.91,
        content: 'Database connection pool exhaustion detected in checkout-service. Multiple timeout errors logged.',
        metadata: {
          service: 'checkout-service',
          type: 'log',
          severity: 'error',
          source: 'datadog'
        },
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      },
      {
        id: 'mock-2',
        score: 0.85,
        content: 'Memory leak detected in payment-service causing gradual performance degradation.',
        metadata: {
          service: 'payment-service',
          type: 'incident',
          severity: 'high',
          source: 'pagerduty'
        },
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    ];
    
    return {
      query: processedQuery,
      results: mockResults,
      totalFound: mockResults.length,
      searchTime: Date.now()
    };
  }

  async assembleContext(searchResult: SearchResult, query: ProcessedQuery): Promise<GenerationContext> {
    const context: GenerationContext = {
      query: query.original,
      entities: query.entities,
      intents: query.intents,
      relevantData: {},
      summary: '',
      timeRange: query.filters.timeRange,
      services: query.filters.service || []
    };
    
    // Group results by type
    searchResult.results.forEach(result => {
      const type = result.metadata.type || 'unknown';
      if (!context.relevantData[type as keyof typeof context.relevantData]) {
        context.relevantData[type as keyof typeof context.relevantData] = [];
      }
      (context.relevantData[type as keyof typeof context.relevantData] as SimilarChunk[]).push(result);
    });
    
    // Generate summary
    const summaryParts: string[] = [];
    Object.entries(context.relevantData).forEach(([type, items]) => {
      if (items.length > 0) {
        summaryParts.push(`Found ${items.length} relevant ${type}`);
      }
    });
    context.summary = summaryParts.join('. ');
    
    return context;
  }

  async generateAnalysis(context: GenerationContext): Promise<LLMResponse> {
    try {
      this.logger.log('Generating LLM analysis');
      
      const prompt = this.buildPrompt(context);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });
      
      const content = response.choices[0].message.content || '';
      
      // Parse the response (simplified parsing for demo)
      return this.parseLLMResponse(content);
      
    } catch (error) {
      this.logger.error('Error in LLM generation', error);
      
      // Return mock response for demo purposes
      return this.getMockLLMResponse(context);
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert incident analysis AI for OpsSage. Your role is to analyze system incidents and provide actionable insights.

Your analysis should include:
1. Root cause hypothesis with confidence score (0-100)
2. Supporting evidence from logs, metrics, and events
3. Similar incidents from history with similarity scores
4. Actionable recommendations with priority levels

Be thorough but concise. Focus on the most likely causes and most impactful recommendations.
Always provide confidence scores and cite your evidence sources.

Respond in JSON format with the following structure:
{
  "rootCause": {
    "hypothesis": "...",
    "confidence": 85,
    "evidence": [
      {
        "type": "log",
        "description": "...",
        "source": "datadog",
        "confidence": 90
      }
    ]
  },
  "similarIncidents": [
    {
      "id": "inc_123",
      "title": "...",
      "similarity": 91,
      "explanation": "..."
    }
  ],
  "recommendations": [
    {
      "title": "...",
      "description": "...",
      "priority": "high",
      "autoExecutable": true,
      "command": "kubectl restart deployment/checkout-service"
    }
  ]
}`;
  }

  private buildPrompt(context: GenerationContext): string {
    let prompt = `Query: ${context.query}\n\n`;
    
    prompt += `Context Summary: ${context.summary}\n\n`;
    
    if (context.relevantData.logs && context.relevantData.logs.length > 0) {
      prompt += `Relevant Logs:\n`;
      context.relevantData.logs.slice(0, 5).forEach((log, index) => {
        prompt += `${index + 1}. ${log.content}\n`;
      });
      prompt += '\n';
    }
    
    if (context.relevantData.incidents && context.relevantData.incidents.length > 0) {
      prompt += `Similar Incidents:\n`;
      context.relevantData.incidents.slice(0, 3).forEach((incident, index) => {
        prompt += `${index + 1}. ${incident.content} (Similarity: ${(incident.score * 100).toFixed(1)}%)\n`;
      });
      prompt += '\n';
    }
    
    prompt += `Time Range: ${context.timeRange?.start} to ${context.timeRange?.end}\n`;
    prompt += `Services: ${context.services.join(', ')}\n\n`;
    
    prompt += `Please analyze this incident and provide a comprehensive analysis including root cause, evidence, similar incidents, and recommendations.`;
    
    return prompt;
  }

  private parseLLMResponse(content: string): LLMResponse {
    try {
      // Try to parse as JSON
      return JSON.parse(content);
    } catch (error) {
      // Fallback parsing
      return {
        rootCause: {
          hypothesis: 'Unable to parse structured response',
          confidence: 0,
          evidence: []
        },
        similarIncidents: [],
        recommendations: []
      };
    }
  }

  private getMockLLMResponse(context: GenerationContext): LLMResponse {
    return {
      rootCause: {
        hypothesis: 'Database connection pool exhaustion in checkout-service',
        confidence: 82,
        evidence: [
          {
            type: 'log',
            description: 'High frequency of connection timeout errors',
            source: 'datadog',
            confidence: 90
          },
          {
            type: 'metric',
            description: 'Database connection utilization at 95%',
            source: 'datadog',
            confidence: 85
          }
        ]
      },
      similarIncidents: [
        {
          id: 'inc_987654321',
          title: 'Checkout service database connection issues',
          similarity: 91,
          explanation: 'Similar incident 14 days ago. Root cause: memory leak in service X. Confidence: 91%'
        }
      ],
      recommendations: [
        {
          title: 'Restart checkout-service',
          description: 'Restart the checkout-service to clear connection pool issues',
          priority: 'high',
          autoExecutable: true,
          command: 'kubectl restart deployment/checkout-service'
        },
        {
          title: 'Increase database connection pool size',
          description: 'Increase the connection pool size to handle higher load',
          priority: 'medium',
          autoExecutable: false
        }
      ]
    };
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Check cache first
      const cacheKey = `embedding:${Buffer.from(text).toString('base64')}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      
      const response = await this.openai.embeddings.create({
        model: this.EMBEDDING_MODEL,
        input: text
      });
      
      const embedding = response.data[0].embedding;
      
      // Cache for 24 hours
      await this.redis.setex(cacheKey, 86400, JSON.stringify(embedding));
      
      return embedding;
      
    } catch (error) {
      this.logger.error('Error generating embedding', error);
      // Return mock embedding for demo purposes
      return new Array(1536).fill(0).map(() => Math.random() - 0.5);
    }
  }

  async storeIncidentEmbedding(incident: any): Promise<void> {
    try {
      const text = `${incident.title} ${incident.description} ${incident.service}`;
      const embedding = await this.generateEmbedding(text);
      
      const index = this.pinecone.Index(this.indexName);
      
      await index.upsert([{
        id: `incident-${incident.id}`,
        values: embedding,
        metadata: {
          content: text,
          source: 'incident',
          timestamp: new Date().toISOString(),
          service: incident.service,
          severity: incident.severity,
          type: 'incident',
          originalId: incident.id
        }
      }]);
      
      this.logger.log(`Stored embedding for incident ${incident.id}`);
      
    } catch (error) {
      this.logger.error('Error storing incident embedding', error);
    }
  }

  async onModuleInit() {
    this.logger.log('RAG Service initialized');
  }
}
