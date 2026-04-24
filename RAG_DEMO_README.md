# RAG Pipeline Demo - Run Instructions

## Overview

This demo shows the complete RAG (Retrieval-Augmented Generation) pipeline in action. The demo includes query processing, vector similarity search, context assembly, and AI-powered incident analysis.

## Prerequisites

### Required Services
1. **Redis** (for caching)
2. **Pinecone** (for vector search) - Optional, demo works with mock data
3. **OpenAI API Key** (for embeddings and LLM) - Optional, demo works with mock data

### Environment Setup
Copy the environment variables:
```bash
cp .env.example .env
```

Set these variables in `.env`:
```bash
# Required for full functionality
OPENAI_API_KEY=your-openai-api-key-here
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_INDEX=opssage-incidents

# Required for caching
REDIS_URL=redis://localhost:6379

# Optional (demo works without these)
NODE_ENV=development
LOG_LEVEL=info
```

## Quick Start

### Option 1: Run Demo Directly
```bash
cd src/services/ai-engine
npm install
npm run rag-demo
```

### Option 2: Run with Full Service
```bash
cd src/services/ai-engine
npm install
npm run start:dev
```

Then test the API:
```bash
# Test RAG analysis
curl -X POST http://localhost:3003/api/v1/rag/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Why is checkout service failing?",
    "services": ["checkout-service"],
    "timeRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-02T00:00:00Z"
    },
    "userId": "demo-user"
  }'
```

## Demo Features

### 1. Query Processing
- **Entity Extraction**: Identifies services, time expressions, error types
- **Intent Detection**: Recognizes root cause, similar incidents, status checks
- **Query Embedding**: Generates vector representations using OpenAI

### 2. Vector Search
- **Similarity Search**: Finds relevant data using Pinecone
- **Hybrid Search**: Combines vector and keyword matching
- **Smart Filtering**: Filters by service, time range, severity

### 3. Context Assembly
- **Data Grouping**: Organizes results by type (logs, metrics, incidents)
- **Relevance Scoring**: Ranks results by multiple signals
- **Context Summarization**: Creates structured context for LLM

### 4. AI Analysis
- **Root Cause Detection**: Identifies likely causes with confidence scores
- **Evidence Correlation**: Links findings to data sources
- **Similar Incidents**: Finds historical patterns
- **Actionable Recommendations**: Provides specific remediation steps

## Demo Queries

The demo runs three different types of queries:

### 1. Root Cause Analysis
```
Query: "Why is checkout service failing?"
Intent: root_cause
Services: [checkout-service]
Time Range: Last 24 hours
```

### 2. Similar Incidents
```
Query: "Find similar incidents to database connection issues"
Intent: similar_incidents
Services: [checkout-service, payment-service]
Time Range: Last 7 days
```

### 3. Status Check
```
Query: "What is the status of payment service?"
Intent: status_check
Services: [payment-service]
Time Range: Last hour
```

## Expected Output

### Sample Analysis Result
```json
{
  "rootCause": {
    "hypothesis": "Database connection pool exhaustion in checkout-service",
    "confidence": 82,
    "evidence": [
      {
        "type": "log",
        "description": "High frequency of connection timeout errors",
        "source": "datadog",
        "confidence": 90
      },
      {
        "type": "metric",
        "description": "Database connection utilization at 95%",
        "source": "datadog",
        "confidence": 85
      }
    ]
  },
  "similarIncidents": [
    {
      "id": "inc_987654321",
      "title": "Checkout service database connection issues",
      "similarity": 91,
      "explanation": "Similar incident 14 days ago. Root cause: memory leak in service X. Confidence: 91%"
    }
  ],
  "recommendations": [
    {
      "title": "Restart checkout-service",
      "description": "Restart the checkout-service to clear connection pool issues",
      "priority": "high",
      "autoExecutable": true,
      "command": "kubectl restart deployment/checkout-service"
    },
    {
      "title": "Increase database connection pool size",
      "description": "Increase the connection pool size to handle higher load",
      "priority": "medium",
      "autoExecutable": false
    }
  ]
}
```

## Troubleshooting

### Common Issues

#### 1. Redis Connection Failed
```bash
# Start Redis
docker run -d -p 6379:6379 redis:latest

# Or install locally
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu
```

#### 2. OpenAI API Errors
```bash
# Check API key
echo $OPENAI_API_KEY

# Test API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

#### 3. Pinecone Connection Issues
```bash
# Check Pinecone API key
echo $PINECONE_API_KEY

# Test connection (Python example)
pip install pinecone-client
python -c "import pinecone; pinecone.init(api_key='$PINECONE_API_KEY'); print(pinecone.list_indexes())"
```

#### 4. TypeScript Compilation Errors
```bash
# Install dependencies
npm install

# Check TypeScript version
npx tsc --version

# Build project
npm run build
```

## Configuration Options

### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4

# Pinecone Configuration
PINECONE_API_KEY=your-api-key
PINECONE_INDEX=opssage-incidents
PINECONE_ENVIRONMENT=us-west1-gcp

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_CACHE_TTL=3600

# Demo Configuration
NODE_ENV=development
LOG_LEVEL=info
```

### Demo Settings
```typescript
// In demo.ts, you can modify:
const demoQueries = [
  {
    query: "Why is checkout service failing?",
    services: ["checkout-service"],
    timeRange: { start: "...", end: "..." },
    userId: "demo-user"
  }
];
```

## Performance Metrics

### Demo Performance
- **Query Processing**: <100ms
- **Vector Search**: <200ms (with Pinecone) / <50ms (mock)
- **LLM Generation**: <2s (with OpenAI) / <100ms (mock)
- **Total Response Time**: <3s (production) / <500ms (demo)

### Scaling Considerations
- **Batch Processing**: Handles 100+ embeddings per batch
- **Caching**: 80%+ cache hit rate for repeated queries
- **Concurrency**: Supports 10+ parallel queries
- **Memory Usage**: ~100MB per service instance

## Monitoring

### Demo Logging
The demo provides structured logging:
```
Starting RAG Pipeline Demo...

Demo Query 1: Root Cause Analysis
Query: "Why is checkout service failing?"

Analysis Result:
{
  "rootCause": { ... },
  "similarIncidents": [ ... ],
  "recommendations": [ ... ]
}

Demo completed successfully!
```

### Health Check
```bash
# Check service health
curl http://localhost:3003/api/v1/rag/health

# Response
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "service": "rag-pipeline",
  "version": "1.0.0"
}
```

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:e2e
```

### Manual Testing
```bash
# Test different query types
npm run rag-demo

# Test API endpoints
curl -X POST http://localhost:3003/api/v1/rag/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "test query", "services": [], "timeRange": {}, "userId": "test"}'
```

## Production Deployment

### Docker Deployment
```bash
# Build image
docker build -t opssage-ai-engine .

# Run container
docker run -d \
  --name opssage-ai-engine \
  -p 3003:3003 \
  --env-file .env \
  opssage-ai-engine
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: opssage-ai-engine
spec:
  replicas: 2
  selector:
    matchLabels:
      app: opssage-ai-engine
  template:
    spec:
      containers:
      - name: ai-engine
        image: opssage-ai-engine:latest
        ports:
        - containerPort: 3003
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: opssage-secrets
              key: openai-api-key
```

## Next Steps

1. **Set up real data sources**: Connect to Datadog, Kubernetes, PagerDuty
2. **Configure Pinecone index**: Create and populate with real incident data
3. **Fine-tune embeddings**: Train custom embedding models for domain data
4. **Add monitoring**: Set up Prometheus metrics and Grafana dashboards
5. **Scale horizontally**: Deploy multiple instances with load balancing

## Additional Resources

- [RAG Pipeline Architecture](docs/architecture/rag-pipeline.md)
- [AI Engine Service Documentation](src/services/ai-engine/README.md)
- [API Documentation](docs/api/README.md)
- [Deployment Guide](deployment/kubernetes/README.md)

---

**Note**: The demo works with mock data if OpenAI and Pinecone are not configured. For full functionality, set up the required services and API keys.
