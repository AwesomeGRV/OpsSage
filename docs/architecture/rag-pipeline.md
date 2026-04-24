# RAG Pipeline Design - OpsSage

## Overview

The Retrieval-Augmented Generation (RAG) pipeline is the core intelligence component of OpsSage, enabling AI-powered incident analysis by combining large language models with domain-specific knowledge retrieval. This design document details the complete architecture, data flow, and implementation of the RAG pipeline.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Sources  │    │   Ingestion     │    │   Processing    │    │   Storage       │
│                 │    │   Layer         │    │   Layer         │    │   Layer         │
│ • Datadog Logs  │───▶│ • Collectors    │───▶│ • Cleaners      │───▶│ • Pinecone      │
│ • K8s Events    │    │ • Parsers       │    │ • Chunkers      │    │ • PostgreSQL    │
│ • PagerDuty     │    │ • Validators    │    │ • Embedders     │    │ • Redis Cache   │
│ • Incidents     │    │ • Enrichers     │    │ • Indexers      │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
          │                      │                      │                      │
          └──────────────────────┼──────────────────────┼──────────────────────┘
                                 │                      │
                    ┌─────────────▼─────────────┐    ┌─────────────▼─────────────┐
                    │   Retrieval Layer        │    │   Generation Layer      │
                    │                          │    │                          │
                    │ • Query Processing       │───▶│ • Context Assembly      │
                    │ • Vector Search          │    │ • LLM Integration       │
                    │ • Similarity Scoring     │    │ • Response Generation   │
                    │ • Ranking                │    │ • Post-processing       │
                    └──────────────────────────┘    └──────────────────────────┘
```

## Component Architecture

### 1. Data Collection Layer

#### 1.1 Data Collectors
```typescript
interface DataCollector {
  collect(timeRange: TimeRange): Promise<RawData[]>
  validate(data: RawData): boolean
  transform(data: RawData): ProcessedData
}

class DatadogCollector implements DataCollector {
  async collect(timeRange: TimeRange): Promise<DatadogData[]> {
    // Collect logs, metrics, traces
    const logs = await this.collectLogs(timeRange);
    const metrics = await this.collectMetrics(timeRange);
    const traces = await this.collectTraces(timeRange);
    
    return [...logs, ...metrics, ...traces];
  }
}

class KubernetesCollector implements DataCollector {
  async collect(timeRange: TimeRange): Promise<K8sData[]> {
    // Collect events, pod status, deployments
    return await this.collectKubernetesEvents(timeRange);
  }
}

class PagerDutyCollector implements DataCollector {
  async collect(timeRange: TimeRange): Promise<IncidentData[]> {
    // Collect incidents and alerts
    return await this.collectIncidents(timeRange);
  }
}
```

#### 1.2 Data Parsers
```typescript
interface DataParser {
  parse(raw: RawData): ParsedData
  extractMetadata(data: ParsedData): Metadata
  enrich(data: ParsedData, context: Context): EnrichedData
}

class LogParser implements DataParser {
  parse(raw: string): LogEntry {
    // Parse structured/unstructured logs
    return this.parseLogEntry(raw);
  }
  
  extractMetadata(entry: LogEntry): LogMetadata {
    return {
      timestamp: entry.timestamp,
      service: entry.service,
      severity: entry.level,
      source: 'datadog',
      tags: entry.tags
    };
  }
}
```

### 2. Processing Layer

#### 2.1 Data Cleaning
```typescript
class DataCleaner {
  clean(data: ProcessedData[]): CleanData[] {
    return data
      .filter(this.removeDuplicates)
      .map(this.normalizeText)
      .map(this.removePII)
      .map(this.standardizeFormat);
  }
  
  private removeDuplicates(data: ProcessedData): boolean {
    // Remove duplicate entries based on hash
    return !this.seen.has(data.hash);
  }
  
  private normalizeText(data: ProcessedData): ProcessedData {
    // Normalize text: lowercase, remove special chars
    data.content = data.content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return data;
  }
  
  private removePII(data: ProcessedData): ProcessedData {
    // Remove personally identifiable information
    data.content = data.content
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CREDIT_CARD]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
    return data;
  }
}
```

#### 2.2 Chunking Strategy
```typescript
class DataChunker {
  private readonly MAX_CHUNK_SIZE = 1000; // tokens
  private readonly OVERLAP_SIZE = 100;   // tokens
  
  chunk(data: CleanData[]): DataChunk[] {
    const chunks: DataChunk[] = [];
    
    for (const item of data) {
      const textChunks = this.splitIntoChunks(item.content);
      
      textChunks.forEach((chunk, index) => {
        chunks.push({
          id: `${item.id}_chunk_${index}`,
          content: chunk,
          metadata: {
            ...item.metadata,
            chunkIndex: index,
            totalChunks: textChunks.length,
            originalId: item.id
          },
          timestamp: item.timestamp,
          source: item.source
        });
      });
    }
    
    return chunks;
  }
  
  private splitIntoChunks(text: string): string[] {
    // Intelligent chunking based on semantic boundaries
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length <= this.MAX_CHUNK_SIZE) {
        currentChunk += sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
}
```

#### 2.3 Embedding Generation
```typescript
class EmbeddingService {
  private readonly openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private readonly EMBEDDING_MODEL = 'text-embedding-ada-002';
  private readonly BATCH_SIZE = 100;
  
  async generateEmbeddings(chunks: DataChunk[]): Promise<EmbeddedChunk[]> {
    const embeddings: EmbeddedChunk[] = [];
    
    // Process in batches to avoid rate limits
    for (let i = 0; i < chunks.length; i += this.BATCH_SIZE) {
      const batch = chunks.slice(i, i + this.BATCH_SIZE);
      const batchEmbeddings = await this.generateBatchEmbeddings(batch);
      embeddings.push(...batchEmbeddings);
    }
    
    return embeddings;
  }
  
  private async generateBatchEmbeddings(chunks: DataChunk[]): Promise<EmbeddedChunk[]> {
    try {
      const response = await this.openAI.embeddings.create({
        model: this.EMBEDDING_MODEL,
        input: chunks.map(chunk => chunk.content)
      });
      
      return chunks.map((chunk, index) => ({
        ...chunk,
        embedding: response.data[index].embedding,
        embeddingModel: this.EMBEDDING_MODEL,
        embeddingDimension: 1536
      }));
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }
}
```

### 3. Storage Layer

#### 3.1 Vector Database (Pinecone)
```typescript
class VectorStore {
  private readonly pinecone: Pinecone;
  private readonly indexName: string;
  
  constructor() {
    this.pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    this.indexName = process.env.PINECONE_INDEX || 'opssage-incidents';
  }
  
  async storeEmbeddings(embeddings: EmbeddedChunk[]): Promise<void> {
    const index = this.pinecone.Index(this.indexName);
    
    const vectors = embeddings.map(chunk => ({
      id: chunk.id,
      values: chunk.embedding,
      metadata: {
        content: chunk.content,
        source: chunk.source,
        timestamp: chunk.timestamp.toISOString(),
        service: chunk.metadata.service,
        severity: chunk.metadata.severity,
        type: chunk.metadata.type,
        originalId: chunk.metadata.originalId
      }
    }));
    
    // Upsert in batches
    for (let i = 0; i < vectors.length; i += 100) {
      const batch = vectors.slice(i, i + 100);
      await index.upsert(batch);
    }
  }
  
  async searchSimilar(queryEmbedding: number[], filters: SearchFilters): Promise<SimilarChunk[]> {
    const index = this.pinecone.Index(this.indexName);
    
    const queryRequest: PineconeQueryRequest = {
      vector: queryEmbedding,
      topK: filters.topK || 10,
      includeMetadata: true,
      filter: this.buildPineconeFilter(filters)
    };
    
    const response = await index.query(queryRequest);
    
    return response.matches.map(match => ({
      id: match.id,
      score: match.score,
      content: match.metadata?.content || '',
      metadata: match.metadata || {},
      timestamp: new Date(match.metadata?.timestamp || Date.now())
    }));
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
        $gte: filters.timeRange.start,
        $lte: filters.timeRange.end
      };
    }
    
    return Object.keys(pineconeFilter).length > 0 ? pineconeFilter : undefined;
  }
}
```

#### 3.2 Document Storage (PostgreSQL)
```typescript
class DocumentStore {
  private readonly repository: DocumentRepository;
  
  async storeDocuments(chunks: DataChunk[]): Promise<void> {
    for (const chunk of chunks) {
      const document = new Document();
      document.id = chunk.id;
      document.content = chunk.content;
      document.metadata = JSON.stringify(chunk.metadata);
      document.source = chunk.source;
      document.timestamp = chunk.timestamp;
      document.createdAt = new Date();
      
      await this.repository.save(document);
    }
  }
  
  async getDocument(id: string): Promise<Document | null> {
    return await this.repository.findOne({ where: { id } });
  }
  
  async searchDocuments(query: DocumentSearchQuery): Promise<Document[]> {
    const qb = this.repository.createQueryBuilder('doc');
    
    if (query.service) {
      qb.andWhere('doc.metadata @> :service', { service: JSON.stringify({ service: query.service }) });
    }
    
    if (query.severity) {
      qb.andWhere('doc.metadata @> :severity', { severity: JSON.stringify({ severity: query.severity }) });
    }
    
    if (query.timeRange) {
      qb.andWhere('doc.timestamp BETWEEN :start AND :end', {
        start: query.timeRange.start,
        end: query.timeRange.end
      });
    }
    
    if (query.textSearch) {
      qb.andWhere('doc.content ILIKE :text', { text: `%${query.textSearch}%` });
    }
    
    return await qb.getMany();
  }
}
```

### 4. Retrieval Layer

#### 4.1 Query Processing
```typescript
class QueryProcessor {
  private readonly embeddingService: EmbeddingService;
  
  async processQuery(query: string, context: QueryContext): Promise<ProcessedQuery> {
    // Extract entities and intents
    const entities = await this.extractEntities(query);
    const intents = await this.detectIntents(query);
    
    // Generate query embedding
    const embedding = await this.embeddingService.generateEmbedding(query);
    
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
  
  private async extractEntities(query: string): Promise<QueryEntity[]> {
    // Use NLP or regex patterns to extract entities
    const entities: QueryEntity[] = [];
    
    // Service names
    const servicePattern = /\b(checkout-service|payment-service|user-service|api-gateway)\b/gi;
    const services = query.match(servicePattern) || [];
    entities.push(...services.map(service => ({
      type: 'service',
      value: service.toLowerCase(),
      confidence: 0.9
    })));
    
    // Time expressions
    const timePattern = /\b(last \d+ (hours|minutes|days)|today|yesterday)\b/gi;
    const times = query.match(timePattern) || [];
    entities.push(...times.map(time => ({
      type: 'time',
      value: time.toLowerCase(),
      confidence: 0.8
    })));
    
    // Error types
    const errorPattern = /\b(timeout|error|failure|crash|exception|5\d{2}|4\d{2})\b/gi;
    const errors = query.match(errorPattern) || [];
    entities.push(...errors.map(error => ({
      type: 'error',
      value: error.toLowerCase(),
      confidence: 0.7
    })));
    
    return entities;
  }
  
  private async detectIntents(query: string): Promise<QueryIntent[]> {
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
}
```

#### 4.2 Similarity Search
```typescript
class SimilaritySearcher {
  private readonly vectorStore: VectorStore;
  private readonly documentStore: DocumentStore;
  
  async search(processedQuery: ProcessedQuery): Promise<SearchResult> {
    // Vector similarity search
    const vectorResults = await this.vectorStore.searchSimilar(
      processedQuery.embedding,
      processedQuery.filters
    );
    
    // Hybrid search: combine vector and keyword search
    const keywordResults = await this.keywordSearch(processedQuery);
    
    // Merge and rank results
    const mergedResults = this.mergeResults(vectorResults, keywordResults);
    
    // Apply re-ranking based on query intent
    const rankedResults = this.rerankResults(mergedResults, processedQuery);
    
    return {
      query: processedQuery,
      results: rankedResults,
      totalFound: mergedResults.length,
      searchTime: Date.now()
    };
  }
  
  private async keywordSearch(query: ProcessedQuery): Promise<KeywordResult[]> {
    const documents = await this.documentStore.searchDocuments({
      textSearch: query.original,
      service: query.filters.service,
      severity: query.filters.severity,
      timeRange: query.filters.timeRange
    });
    
    return documents.map(doc => ({
      id: doc.id,
      content: doc.content,
      score: this.calculateKeywordScore(doc.content, query.original),
      metadata: JSON.parse(doc.metadata),
      timestamp: doc.timestamp
    }));
  }
  
  private mergeResults(vectorResults: SimilarChunk[], keywordResults: KeywordResult[]): MergedResult[] {
    const mergedMap = new Map<string, MergedResult>();
    
    // Add vector results
    vectorResults.forEach(result => {
      mergedMap.set(result.id, {
        ...result,
        vectorScore: result.score,
        keywordScore: 0,
        combinedScore: result.score
      });
    });
    
    // Add keyword results and merge
    keywordResults.forEach(result => {
      const existing = mergedMap.get(result.id);
      if (existing) {
        existing.keywordScore = result.score;
        existing.combinedScore = (existing.vectorScore * 0.7) + (result.score * 0.3);
      } else {
        mergedMap.set(result.id, {
          ...result,
          vectorScore: 0,
          keywordScore: result.score,
          combinedScore: result.score * 0.3
        });
      }
    });
    
    return Array.from(mergedMap.values())
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, 20); // Top 20 results
  }
  
  private rerankResults(results: MergedResult[], query: ProcessedQuery): MergedResult[] {
    // Apply intent-based re-ranking
    const intents = query.intents.map(i => i.type);
    
    return results.map(result => {
      let adjustedScore = result.combinedScore;
      
      // Boost recent results for status checks
      if (intents.includes('status_check')) {
        const recency = this.calculateRecency(result.timestamp);
        adjustedScore *= (1 + recency * 0.2);
      }
      
      // Boost similar incidents for similarity searches
      if (intents.includes('similar_incidents') && result.metadata.type === 'incident') {
        adjustedScore *= 1.3;
      }
      
      // Boost error logs for root cause analysis
      if (intents.includes('root_cause') && result.metadata.severity === 'error') {
        adjustedScore *= 1.2;
      }
      
      return {
        ...result,
        finalScore: adjustedScore
      };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }
  
  private calculateKeywordScore(content: string, query: string): number {
    // Simple TF-IDF like scoring
    const queryTerms = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    let score = 0;
    queryTerms.forEach(term => {
      const termCount = (contentLower.match(new RegExp(term, 'g')) || []).length;
      score += termCount / contentLower.split(/\s+/).length;
    });
    
    return Math.min(score, 1);
  }
  
  private calculateRecency(timestamp: Date): number {
    const now = new Date();
    const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    return Math.exp(-hoursDiff / 24); // Decay over 24 hours
  }
}
```

### 5. Generation Layer

#### 5.1 Context Assembly
```typescript
class ContextAssembler {
  async assembleContext(searchResult: SearchResult, query: ProcessedQuery): Promise<GenerationContext> {
    const context: GenerationContext = {
      query: query.original,
      entities: query.entities,
      intents: query.intents,
      relevantData: [],
      summary: '',
      timeRange: query.filters.timeRange,
      services: query.filters.service || []
    };
    
    // Select top results based on query intent
    const topResults = this.selectTopResults(searchResult.results, query.intents);
    
    // Group results by type
    const groupedResults = this.groupResultsByType(topResults);
    
    // Create structured context
    context.relevantData = {
      logs: groupedResults.logs || [],
      metrics: groupedResults.metrics || [],
      incidents: groupedResults.incidents || [],
      events: groupedResults.events || []
    };
    
    // Generate summary
    context.summary = this.generateContextSummary(context.relevantData);
    
    return context;
  }
  
  private selectTopResults(results: MergedResult[], intents: QueryIntent[]): MergedResult[] {
    // Select based on query intent and diversity
    const selected: MergedResult[] = [];
    const usedTypes = new Set<string>();
    
    // Always include highest scoring results
    const sortedResults = results.sort((a, b) => b.finalScore - a.finalScore);
    
    for (const result of sortedResults) {
      if (selected.length >= 10) break;
      
      const type = result.metadata.type || 'unknown';
      
      // Ensure diversity of result types
      if (!usedTypes.has(type) || selected.length < 5) {
        selected.push(result);
        usedTypes.add(type);
      }
    }
    
    return selected;
  }
  
  private groupResultsByType(results: MergedResult[]): Record<string, MergedResult[]> {
    const grouped: Record<string, MergedResult[]> = {};
    
    results.forEach(result => {
      const type = result.metadata.type || 'unknown';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(result);
    });
    
    return grouped;
  }
  
  private generateContextSummary(relevantData: any): string {
    const summary: string[] = [];
    
    if (relevantData.logs && relevantData.logs.length > 0) {
      summary.push(`Found ${relevantData.logs.length} relevant log entries`);
    }
    
    if (relevantData.metrics && relevantData.metrics.length > 0) {
      summary.push(`Found ${relevantData.metrics.length} relevant metrics`);
    }
    
    if (relevantData.incidents && relevantData.incidents.length > 0) {
      summary.push(`Found ${relevantData.incidents.length} similar incidents`);
    }
    
    if (relevantData.events && relevantData.events.length > 0) {
      summary.push(`Found ${relevantData.events.length} relevant events`);
    }
    
    return summary.join('. ');
  }
}
```

#### 5.2 LLM Integration
```typescript
class LLMService {
  private readonly openAI: OpenAI;
  private readonly MODEL = 'gpt-4';
  
  constructor() {
    this.openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  
  async generateAnalysis(context: GenerationContext): Promise<LLMResponse> {
    const prompt = this.buildPrompt(context);
    
    try {
      const response = await this.openAI.chat.completions.create({
        model: this.MODEL,
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
        temperature: 0.3,
        functions: [
          {
            name: 'analyze_incident',
            description: 'Analyze incident and provide structured response',
            parameters: {
              type: 'object',
              properties: {
                rootCause: {
                  type: 'object',
                  properties: {
                    hypothesis: { type: 'string' },
                    confidence: { type: 'number' },
                    evidence: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          type: { type: 'string' },
                          description: { type: 'string' },
                          source: { type: 'string' },
                          confidence: { type: 'number' }
                        }
                      }
                    }
                  }
                },
                similarIncidents: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      title: { type: 'string' },
                      similarity: { type: 'number' },
                      explanation: { type: 'string' }
                    }
                  }
                },
                recommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      description: { type: 'string' },
                      priority: { type: 'string' },
                      autoExecutable: { type: 'boolean' },
                      command: { type: 'string' }
                    }
                  }
                }
              },
              required: ['rootCause', 'similarIncidents', 'recommendations']
            }
          }
        ],
        function_call: { name: 'analyze_incident' }
      });
      
      const functionCall = response.choices[0].message.function_call;
      if (functionCall) {
        return JSON.parse(functionCall.arguments);
      }
      
      // Fallback to text parsing
      return this.parseTextResponse(response.choices[0].message.content || '');
      
    } catch (error) {
      console.error('LLM generation error:', error);
      throw new Error('Failed to generate analysis');
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
Always provide confidence scores and cite your evidence sources.`;
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
    
    if (context.relevantData.metrics && context.relevantData.metrics.length > 0) {
      prompt += `Relevant Metrics:\n`;
      context.relevantData.metrics.slice(0, 3).forEach((metric, index) => {
        prompt += `${index + 1}. ${metric.content}\n`;
      });
      prompt += '\n';
    }
    
    prompt += `Time Range: ${context.timeRange?.start} to ${context.timeRange?.end}\n`;
    prompt += `Services: ${context.services.join(', ')}\n\n`;
    
    prompt += `Please analyze this incident and provide a comprehensive analysis including root cause, evidence, similar incidents, and recommendations.`;
    
    return prompt;
  }
  
  private parseTextResponse(text: string): LLMResponse {
    // Fallback parsing if function calling fails
    // This is a simplified version - in production, you'd use more sophisticated parsing
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
```

## Data Flow

### 1. Ingestion Pipeline
```
Data Sources → Collectors → Parsers → Cleaners → Chunkers → Embedders → Storage
```

1. **Collection**: Gather data from Datadog, Kubernetes, PagerDuty
2. **Parsing**: Extract structured information from raw data
3. **Cleaning**: Remove duplicates, normalize text, remove PII
4. **Chunking**: Split into semantically meaningful chunks
5. **Embedding**: Generate vector embeddings using OpenAI
6. **Storage**: Store in Pinecone (vectors) and PostgreSQL (documents)

### 2. Query Pipeline
```
User Query → Query Processing → Vector Search → Context Assembly → LLM Generation → Response
```

1. **Query Processing**: Extract entities, detect intents, generate embeddings
2. **Vector Search**: Find similar chunks using Pinecone
3. **Context Assembly**: Structure retrieved data for LLM
4. **LLM Generation**: Generate analysis using GPT-4
5. **Response**: Format and return structured analysis

## Performance Optimizations

### 1. Caching Strategy
```typescript
class RAGCache {
  private readonly redis: Redis;
  
  async cacheQuery(query: string, result: SearchResult): Promise<void> {
    const key = `rag:query:${this.hashQuery(query)}`;
    await this.redis.setex(key, 3600, JSON.stringify(result)); // 1 hour cache
  }
  
  async getCachedQuery(query: string): Promise<SearchResult | null> {
    const key = `rag:query:${this.hashQuery(query)}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async cacheEmbedding(text: string, embedding: number[]): Promise<void> {
    const key = `rag:embedding:${this.hashText(text)}`;
    await this.redis.setex(key, 86400, JSON.stringify(embedding)); // 24 hour cache
  }
  
  async getCachedEmbedding(text: string): Promise<number[] | null> {
    const key = `rag:embedding:${this.hashText(text)}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
}
```

### 2. Batch Processing
```typescript
class BatchProcessor {
  private readonly BATCH_SIZE = 100;
  private readonly MAX_CONCURRENT = 5;
  
  async processBatch<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
      const batch = items.slice(i, i + this.BATCH_SIZE);
      const batchResults = await processor(batch);
      results.push(...batchResults);
    }
    
    return results;
  }
  
  async processConcurrent<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const semaphore = new Semaphore(this.MAX_CONCURRENT);
    
    const promises = items.map(async item => {
      await semaphore.acquire();
      try {
        return await processor(item);
      } finally {
        semaphore.release();
      }
    });
    
    return Promise.all(promises);
  }
}
```

### 3. Index Optimization
```typescript
class IndexOptimizer {
  async optimizePineconeIndex(): Promise<void> {
    const index = this.pinecone.Index(this.indexName);
    
    // Configure index for optimal performance
    await index.configure({
      replicas: 2, // Multiple replicas for high availability
      podType: 'p1.x1' // Appropriate pod type for workload
    });
    
    // Create namespace for different data types
    const namespaces = ['logs', 'metrics', 'incidents', 'events'];
    for (const ns of namespaces) {
      // Namespace operations go here
    }
  }
  
  async createHybridIndex(): Promise<void> {
    // Create hybrid vector + keyword index
    // This would involve setting up both Pinecone and Elasticsearch
  }
}
```

## Monitoring and Observability

### 1. Metrics Collection
```typescript
class RAGMetrics {
  private readonly prometheus: Prometheus;
  
  recordQueryDuration(duration: number, queryType: string): void {
    this.prometheus.histogram('rag_query_duration_seconds')
      .labels(queryType)
      .observe(duration);
  }
  
  recordEmbeddingCount(count: number): void {
    this.prometheus.counter('rag_embeddings_total').inc(count);
  }
  
  recordCacheHit(hit: boolean): void {
    this.prometheus.counter('rag_cache_requests').inc({ hit: hit.toString() });
  }
  
  recordLLMCall(model: string, tokens: number, duration: number): void {
    this.prometheus.histogram('rag_llm_duration_seconds')
      .labels(model)
      .observe(duration);
    
    this.prometheus.counter('rag_llm_tokens_total')
      .labels(model)
      .inc(tokens);
  }
}
```

### 2. Error Handling
```typescript
class RAGErrorHandler {
  async handleIngestionError(error: Error, data: any): Promise<void> {
    console.error('Ingestion error:', error);
    
    // Store failed data for retry
    await this.deadLetterQueue.add({
      error: error.message,
      data,
      timestamp: new Date(),
      retryCount: 0
    });
  }
  
  async handleQueryError(error: Error, query: string): Promise<void> {
    console.error('Query error:', error);
    
    // Log error with context
    await this.errorLogger.log({
      type: 'query_error',
      error: error.message,
      query,
      timestamp: new Date()
    });
    
    // Return fallback response
    throw new RAGQueryError('Unable to process query', error);
  }
}
```

## Security Considerations

### 1. Data Privacy
```typescript
class PrivacyManager {
  private readonly piiDetector = new PIIDetector();
  
  async sanitizeData(data: string): Promise<string> {
    // Detect and remove PII
    const pii = await this.piiDetector.detect(data);
    
    let sanitized = data;
    pii.forEach(item => {
      sanitized = sanitized.replace(item.text, `[${item.type.toUpperCase()}]`);
    });
    
    return sanitized;
  }
  
  async encryptSensitiveData(data: string): Promise<string> {
    // Encrypt highly sensitive data before storage
    return await this.encryption.encrypt(data);
  }
}
```

### 2. Access Control
```typescript
class AccessController {
  async validateAccess(userId: string, query: string): Promise<boolean> {
    // Check user permissions for requested data
    const userPermissions = await this.getUserPermissions(userId);
    const requiredPermissions = this.getRequiredPermissions(query);
    
    return requiredPermissions.every(perm => userPermissions.includes(perm));
  }
  
  async filterResults(results: SearchResult[], userId: string): Promise<SearchResult> {
    // Filter results based on user access level
    const userAccess = await this.getUserAccessLevel(userId);
    
    return {
      ...results,
      results: results.results.filter(result => 
        this.hasAccessToResult(result, userAccess)
      )
    };
  }
}
```

## Testing Strategy

### 1. Unit Tests
```typescript
describe('RAG Pipeline', () => {
  let ragPipeline: RAGPipeline;
  
  beforeEach(() => {
    ragPipeline = new RAGPipeline();
  });
  
  it('should process query and return analysis', async () => {
    const query = 'Why is checkout service failing?';
    const result = await ragPipeline.analyze(query, mockContext);
    
    expect(result.rootCause).toBeDefined();
    expect(result.rootCause.confidence).toBeGreaterThan(0);
    expect(result.similarIncidents).toBeInstanceOf(Array);
    expect(result.recommendations).toBeInstanceOf(Array);
  });
  
  it('should handle empty results gracefully', async () => {
    const query = 'Non-existent service issue';
    const result = await ragPipeline.analyze(query, mockContext);
    
    expect(result.rootCause.hypothesis).toContain('No relevant data');
    expect(result.similarIncidents).toHaveLength(0);
  });
});
```

### 2. Integration Tests
```typescript
describe('RAG Integration', () => {
  it('should integrate with Pinecone', async () => {
    const vectorStore = new VectorStore();
    await vectorStore.storeEmbeddings(mockEmbeddings);
    
    const results = await vectorStore.searchSimilar(mockQueryEmbedding, {});
    
    expect(results).toHaveLength(5);
    expect(results[0].score).toBeGreaterThan(0.8);
  });
  
  it('should integrate with OpenAI', async () => {
    const llmService = new LLMService();
    const response = await llmService.generateAnalysis(mockContext);
    
    expect(response.rootCause).toBeDefined();
    expect(response.recommendations).toHaveLength.greaterThan(0);
  });
});
```

## Deployment Configuration

### 1. Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000

# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=opssage-incidents
PINECONE_ENVIRONMENT=us-west1-gcp

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_CACHE_TTL=3600

# PostgreSQL Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/opssage

# Performance Configuration
BATCH_SIZE=100
MAX_CONCURRENT=5
EMBEDDING_CACHE_TTL=86400
```

### 2. Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rag-pipeline
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rag-pipeline
  template:
    metadata:
      labels:
        app: rag-pipeline
    spec:
      containers:
      - name: rag-pipeline
        image: opssage/rag-pipeline:latest
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: opssage-secrets
              key: openai-api-key
        - name: PINECONE_API_KEY
          valueFrom:
            secretKeyRef:
              name: opssage-secrets
              key: pinecone-api-key
```

## Future Enhancements

### 1. Multi-Modal RAG
- Support for images, charts, and graphs
- OCR and visual data extraction
- Cross-modal similarity search

### 2. Real-time Streaming
- Live data streaming from monitoring systems
- Incremental index updates
- Real-time query processing

### 3. Advanced Retrieval
- Hierarchical retrieval strategies
- Query expansion and reformulation
- Active learning for relevance feedback

### 4. Custom Models
- Fine-tuned embedding models for domain-specific data
- Custom LLM fine-tuning for incident analysis
- Domain-specific prompt engineering

This comprehensive RAG pipeline design provides the foundation for OpsSage's AI-powered incident analysis capabilities, enabling accurate, context-aware, and actionable insights from diverse data sources.
