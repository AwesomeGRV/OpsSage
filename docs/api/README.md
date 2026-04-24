# API Design Documentation

##  Overview

OpsSage provides a comprehensive RESTful API for incident management, AI analysis, and system integration. All APIs follow REST principles and use JSON for data exchange.

##  Authentication

### OAuth 2.0 Bearer Token
```http
Authorization: Bearer <access_token>
```

### API Key (for service-to-service)
```http
X-API-Key: <api_key>
```

##  Base URLs

- **Production**: `https://api.opssage.io/v1`
- **Staging**: `https://staging-api.opssage.io/v1`
- **Development**: `http://localhost:3000/v1`

##  Core Endpoints

### 1. Incident Analysis

#### Analyze Incident
```http
POST /incidents/analyze
```

**Request Body:**
```json
{
  "query": "Why is checkout service failing?",
  "timeRange": {
    "start": "2024-01-15T10:00:00Z",
    "end": "2024-01-15T11:00:00Z"
  },
  "services": ["checkout-service", "payment-service"],
  "severity": "high",
  "dataSources": ["datadog", "kubernetes", "pagerduty"],
  "includeSimilarIncidents": true,
  "maxSimilarIncidents": 5
}
```

**Response:**
```json
{
  "id": "inc_123456789",
  "query": "Why is checkout service failing?",
  "analysis": {
    "rootCause": {
      "hypothesis": "Database connection pool exhaustion in checkout-service",
      "confidence": 82,
      "evidence": [
        {
          "type": "log_pattern",
          "description": "High frequency of connection timeout errors",
          "source": "datadog",
          "count": 347
        },
        {
          "type": "metric_anomaly",
          "description": "Database connection utilization at 95%",
          "source": "datadog",
          "value": 0.95
        }
      ]
    },
    "similarIncidents": [
      {
        "id": "inc_987654321",
        "timestamp": "2024-01-01T14:30:00Z",
        "similarity": 91,
        "rootCause": "Memory leak in checkout-service",
        "resolution": "Restarted service and increased memory limits"
      }
    ],
    "recommendations": [
      {
        "type": "immediate_action",
        "title": "Restart checkout-service",
        "description": "Immediate restart to clear connection pool",
        "priority": "high",
        "autoExecutable": true,
        "command": "kubectl rollout restart deployment/checkout-service"
      },
      {
        "type": "runbook",
        "title": "Database Connection Pool Optimization",
        "description": "Increase max connection pool size",
        "priority": "medium",
        "runbookId": "rb_db_pool_config"
      }
    ],
    "timeline": [
      {
        "timestamp": "2024-01-15T10:15:00Z",
        "type": "alert_triggered",
        "description": "High error rate detected in checkout-service"
      },
      {
        "timestamp": "2024-01-15T10:12:00Z",
        "type": "deployment",
        "description": "New version deployed to checkout-service"
      }
    ]
  },
  "metadata": {
    "analysisDuration": 23.5,
    "dataPointsAnalyzed": 15420,
    "modelVersion": "gpt-4-1106"
  }
}
```

#### Get Incident Summary
```http
GET /incidents/{incidentId}/summary
```

**Response:**
```json
{
  "incidentId": "inc_123456789",
  "title": "Checkout service high latency",
  "status": "investigating",
  "severity": "high",
  "createdAt": "2024-01-15T10:15:00Z",
  "updatedAt": "2024-01-15T10:45:00Z",
  "assignedTo": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@company.com"
  },
  "summary": {
    "impact": {
      "services": ["checkout-service", "payment-service"],
      "usersAffected": 1250,
      "errorRate": 0.15
    },
    "timeline": {
      "firstAlert": "2024-01-15T10:15:00Z",
      "lastUpdate": "2024-01-15T10:45:00Z",
      "duration": 30
    },
    "actions": {
      "total": 5,
      "completed": 2,
      "pending": 3
    }
  }
}
```

### 2. Similar Incidents

#### Search Similar Incidents
```http
POST /incidents/similar
```

**Request Body:**
```json
{
  "incidentId": "inc_123456789",
  "filters": {
    "timeRange": "30d",
    "services": ["checkout-service"],
    "severity": ["high", "critical"],
    "minSimilarity": 70
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

**Response:**
```json
{
  "incidents": [
    {
      "id": "inc_987654321",
      "title": "Checkout service database connection issues",
      "similarity": 91,
      "timestamp": "2024-01-01T14:30:00Z",
      "duration": 45,
      "severity": "high",
      "rootCause": "Database connection pool exhaustion",
      "resolution": "Increased connection pool size and restarted service",
      "tags": ["database", "connection-pool", "checkout"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "hasMore": false
  }
}
```

### 3. Runbook Recommendations

#### Get Runbook Suggestions
```http
POST /runbooks/suggest
```

**Request Body:**
```json
{
  "incidentContext": {
    "services": ["checkout-service"],
    "errorPatterns": ["connection_timeout", "database_error"],
    "metrics": {
      "cpu": 0.85,
      "memory": 0.92,
      "errorRate": 0.15
    },
    "recentDeployments": [
      {
        "service": "checkout-service",
        "version": "v2.3.1",
        "timestamp": "2024-01-15T10:12:00Z"
      }
    ]
  },
  "userContext": {
    "role": "sre",
    "permissions": ["restart_service", "rollback_deployment"]
  }
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "runbookId": "rb_service_restart",
      "title": "Service Restart Procedure",
      "description": "Safely restart a service with zero downtime",
      "relevance": 95,
      "estimatedTime": "5 minutes",
      "steps": [
        {
          "order": 1,
          "title": "Check service health",
          "command": "kubectl get pods -l app=checkout-service",
          "verification": "Pod status should be Running"
        },
        {
          "order": 2,
          "title": "Perform rolling restart",
          "command": "kubectl rollout restart deployment/checkout-service",
          "verification": "New pods should be healthy"
        }
      ],
      "autoExecutable": true,
      "riskLevel": "low"
    },
    {
      "runbookId": "rb_deployment_rollback",
      "title": "Deployment Rollback",
      "description": "Rollback to previous stable version",
      "relevance": 78,
      "estimatedTime": "10 minutes",
      "steps": [
        {
          "order": 1,
          "title": "Get deployment history",
          "command": "kubectl rollout history deployment/checkout-service"
        },
        {
          "order": 2,
          "title": "Rollback to previous version",
          "command": "kubectl rollout undo deployment/checkout-service"
        }
      ],
      "autoExecutable": true,
      "riskLevel": "medium"
    }
  ]
}
```

#### Execute Runbook
```http
POST /runbooks/{runbookId}/execute
```

**Request Body:**
```json
{
  "incidentId": "inc_123456789",
  "parameters": {
    "service": "checkout-service",
    "namespace": "production"
  },
  "dryRun": false
}
```

**Response:**
```json
{
  "executionId": "exec_456789",
  "status": "running",
  "startedAt": "2024-01-15T11:00:00Z",
  "steps": [
    {
      "order": 1,
      "title": "Check service health",
      "status": "completed",
      "output": "Pods: checkout-service-7d6f8c9c5-abcde (Running)",
      "duration": 2.3
    },
    {
      "order": 2,
      "title": "Perform rolling restart",
      "status": "running",
      "output": "deployment.apps/checkout-service restarted"
    }
  ]
}
```

### 4. Data Collection

#### Collect Incident Data
```http
POST /data/collect
```

**Request Body:**
```json
{
  "timeRange": {
    "start": "2024-01-15T10:00:00Z",
    "end": "2024-01-15T11:00:00Z"
  },
  "services": ["checkout-service"],
  "dataTypes": ["logs", "metrics", "traces", "events"],
  "filters": {
    "severity": "error",
    "keywords": ["timeout", "connection"]
  }
}
```

**Response:**
```json
{
  "collectionId": "col_123456",
  "status": "completed",
  "data": {
    "logs": {
      "source": "datadog",
      "count": 1247,
      "sample": [
        {
          "timestamp": "2024-01-15T10:15:23Z",
          "level": "error",
          "message": "Database connection timeout after 30s",
          "service": "checkout-service",
          "traceId": "trace_789"
        }
      ]
    },
    "metrics": {
      "source": "datadog",
      "series": [
        {
          "metric": "checkout_service.error_rate",
          "points": [
            {
              "timestamp": "2024-01-15T10:15:00Z",
              "value": 0.15
            }
          ]
        }
      ]
    },
    "traces": {
      "source": "datadog",
      "count": 89,
      "sample": [
        {
          "traceId": "trace_789",
          "spanId": "span_123",
          "service": "checkout-service",
          "operation": "process_payment",
          "duration": 35000,
          "error": true
        }
      ]
    }
  }
}
```

### 5. Knowledge Base

#### Store Incident
```http
POST /knowledge/incidents
```

**Request Body:**
```json
{
  "incident": {
    "id": "inc_123456789",
    "title": "Checkout service high latency",
    "description": "Database connection pool exhaustion causing timeouts",
    "service": "checkout-service",
    "severity": "high",
    "rootCause": {
      "hypothesis": "Database connection pool exhaustion",
      "confidence": 82
    },
    "resolution": {
      "actions": ["Restarted service", "Increased connection pool size"],
      "duration": 45,
      "verified": true
    },
    "tags": ["database", "connection-pool", "checkout", "timeout"],
    "metadata": {
      "impact": {
        "usersAffected": 1250,
        "revenueImpact": 50000
      }
    }
  }
}
```

#### Search Knowledge Base
```http
GET /knowledge/search?q=database%20connection%20pool&limit=10
```

**Response:**
```json
{
  "results": [
    {
      "id": "inc_987654321",
      "title": "Database connection pool exhaustion",
      "relevance": 0.94,
      "snippet": "Database connection pool exhaustion in checkout-service causing...",
      "metadata": {
        "service": "checkout-service",
        "timestamp": "2024-01-01T14:30:00Z",
        "tags": ["database", "connection-pool"]
      }
    }
  ],
  "total": 15,
  "searchTime": 0.12
}
```

### 6. ChatOps Integration

#### Process Slack Command
```http
POST /chatops/slack/command
```

**Request Body:**
```json
{
  "command": "/incident",
  "text": "analyze checkout-service",
  "user_id": "U123456",
  "channel_id": "C789012",
  "team_id": "T345678"
}
```

**Response:**
```json
{
  "response_type": "in_channel",
  "text": " Analyzing checkout-service incident...",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "* Incident Analysis Started*\n\nAnalyzing checkout-service for the last 60 minutes..."
      }
    }
  ]
}
```

##  API Rate Limits

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/incidents/analyze` | 100 requests | 1 minute |
| `/incidents/similar` | 200 requests | 1 minute |
| `/runbooks/suggest` | 150 requests | 1 minute |
| `/data/collect` | 50 requests | 1 minute |
| `/knowledge/*` | 500 requests | 1 minute |

##  Webhooks

### Incident Status Updates
```http
POST /webhooks/incident-status
```

**Payload:**
```json
{
  "event": "incident.status_changed",
  "incidentId": "inc_123456789",
  "oldStatus": "investigating",
  "newStatus": "resolved",
  "timestamp": "2024-01-15T12:00:00Z",
  "updatedBy": {
    "id": "user_123",
    "name": "John Doe"
  }
}
```

### Analysis Completed
```http
POST /webhooks/analysis-completed
```

**Payload:**
```json
{
  "event": "analysis.completed",
  "incidentId": "inc_123456789",
  "analysisId": "analysis_456",
  "duration": 23.5,
  "confidence": 82,
  "recommendations": 3,
  "timestamp": "2024-01-15T11:30:00Z"
}
```

##  Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "INCIDENT_NOT_FOUND",
    "message": "Incident with ID 'inc_123456789' not found",
    "details": {
      "incidentId": "inc_123456789",
      "timestamp": "2024-01-15T11:00:00Z"
    },
    "requestId": "req_789456123"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INCIDENT_NOT_FOUND` | 404 | Incident not found |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `RATE_LIMIT_EXCEEDED` | 429 | API rate limit exceeded |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | External service unavailable |

##  SDK Examples

### Node.js SDK
```typescript
import { OpsSageClient } from '@opssage/sdk';

const client = new OpsSageClient({
  apiKey: process.env.OPSSAGE_API_KEY,
  baseUrl: 'https://api.opssage.io/v1'
});

// Analyze incident
const analysis = await client.incidents.analyze({
  query: "Why is checkout service failing?",
  services: ["checkout-service"],
  timeRange: {
    start: new Date(Date.now() - 60 * 60 * 1000),
    end: new Date()
  }
});

// Get similar incidents
const similar = await client.incidents.findSimilar({
  incidentId: analysis.id,
  filters: { minSimilarity: 70 }
});
```

### Python SDK
```python
from opssage import OpsSageClient

client = OpsSageClient(
    api_key=os.environ['OPSSAGE_API_KEY'],
    base_url='https://api.opssage.io/v1'
)

# Analyze incident
analysis = client.incidents.analyze(
    query="Why is checkout service failing?",
    services=["checkout-service"],
    time_range={
        "start": "2024-01-15T10:00:00Z",
        "end": "2024-01-15T11:00:00Z"
    }
)

# Get runbook suggestions
suggestions = client.runbooks.suggest(
    incident_context={
        "services": ["checkout-service"],
        "error_patterns": ["connection_timeout"]
    }
)
```
