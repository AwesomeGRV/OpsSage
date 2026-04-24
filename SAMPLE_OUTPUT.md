# OpsSage Sample Output

## Killer Feature Demonstration

### Input Query
```
"Why is checkout service failing?"
```

### Output Response

```json
{
  "incidentId": "inc_123456789",
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
          "confidence": 90,
          "data": {
            "pattern": "Connection timeout after 30s",
            "count": 347,
            "samples": [
              "2024-01-15T10:15:23Z ERROR Connection timeout after 30s",
              "2024-01-15T10:15:24Z ERROR Connection timeout after 30s",
              "2024-01-15T10:15:25Z ERROR Connection timeout after 30s"
            ]
          }
        },
        {
          "type": "metric_anomaly",
          "description": "Database connection utilization at 95%",
          "source": "datadog",
          "confidence": 85,
          "data": {
            "metric": "checkout_service.db_connections",
            "expectedValue": 50,
            "actualValue": 95,
            "deviation": 90
          }
        },
        {
          "type": "deployment",
          "description": "New version deployed 3 minutes before issues started",
          "source": "kubernetes",
          "confidence": 75,
          "data": {
            "deploymentId": "deploy_abc123",
            "version": "v2.3.1",
            "previousVersion": "v2.3.0",
            "timestamp": "2024-01-15T10:12:00Z"
          }
        }
      ],
      "contributingFactors": [
        {
          "factor": "Recent deployment with potential connection leak",
          "impact": "high",
          "description": "New version may have introduced connection pool leak"
        },
        {
          "factor": "Increased traffic load",
          "impact": "medium",
          "description": "Traffic increased by 25% in the last hour"
        }
      ]
    },
    "similarIncidents": [
      {
        "id": "inc_987654321",
        "title": "Checkout service database connection issues",
        "similarity": 91,
        "breakdown": {
          "semantic": 94,
          "structural": 88,
          "temporal": 85,
          "impact": 92,
          "resolution": 89
        },
        "metadata": {
          "title": "Checkout service database connection exhaustion",
          "timestamp": "2024-01-01T14:30:00Z",
          "service": "checkout-service",
          "severity": "high",
          "rootCause": "Database connection pool exhaustion",
          "resolution": "Increased connection pool size and restarted service",
          "duration": 45
        },
        "snippet": "Database connection timeout errors in checkout-service...",
        "explanation": " **Similar incident 14 days ago. Root cause: memory leak in service X**\n\nMatched because: same service, similar error patterns, similar metrics anomalies. Confidence: 91%"
      },
      {
        "id": "inc_456789123",
        "title": "Payment service connection pool issues",
        "similarity": 78,
        "breakdown": {
          "semantic": 82,
          "structural": 75,
          "temporal": 70,
          "impact": 85,
          "resolution": 80
        },
        "metadata": {
          "title": "Payment service connection pool issues",
          "timestamp": "2024-01-08T09:15:00Z",
          "service": "payment-service",
          "severity": "medium",
          "rootCause": "Connection pool configuration too low",
          "resolution": "Increased max connections from 50 to 100",
          "duration": 30
        },
        "snippet": "Connection pool exhausted in payment service...",
        "explanation": "Similar incident 7 days ago. Root cause: connection pool configuration too low. Confidence: 78%"
      }
    ],
    "recommendations": [
      {
        "id": "rec_001",
        "type": "immediate_action",
        "title": "Restart checkout-service",
        "description": "Immediate restart to clear connection pool and restore service",
        "priority": "high",
        "autoExecutable": true,
        "command": "kubectl rollout restart deployment/checkout-service",
        "estimatedTime": 5,
        "riskLevel": "low",
        "confidence": 90,
        "reasoning": "Service restart will clear connection pool and is low risk"
      },
      {
        "id": "rec_002",
        "type": "runbook",
        "title": "Database Connection Pool Optimization",
        "description": "Increase connection pool size and monitor for leaks",
        "priority": "medium",
        "autoExecutable": true,
        "runbookId": "rb_db_pool_config",
        "estimatedTime": 10,
        "riskLevel": "low",
        "confidence": 85,
        "reasoning": "Based on similar incident resolution pattern"
      },
      {
        "id": "rec_003",
        "type": "investigation",
        "title": "Investigate Connection Leak in v2.3.1",
        "description": "Review code changes in latest deployment for potential connection leaks",
        "priority": "medium",
        "autoExecutable": false,
        "estimatedTime": 30,
        "riskLevel": "low",
        "confidence": 75,
        "reasoning": "Recent deployment coincides with issue onset"
      }
    ],
    "timeline": [
      {
        "timestamp": "2024-01-15T10:12:00Z",
        "type": "deployment",
        "title": "New version deployed",
        "description": "Checkout-service v2.3.1 deployed to production",
        "severity": "info"
      },
      {
        "timestamp": "2024-01-15T10:15:00Z",
        "type": "alert_triggered",
        "title": "High error rate detected",
        "description": "Error rate exceeded 5% threshold in checkout-service",
        "severity": "warning"
      },
      {
        "timestamp": "2024-01-15T10:16:30Z",
        "type": "metric_anomaly",
        "title": "Database connection pool exhaustion",
        "description": "Database connections at 95% capacity",
        "severity": "critical"
      },
      {
        "timestamp": "2024-01-15T10:17:45Z",
        "type": "user_action",
        "title": "OpsSage analysis initiated",
        "description": "User requested incident analysis via Slack",
        "severity": "info"
      }
    ]
  },
  "metadata": {
    "analysisDuration": 23.5,
    "dataPointsAnalyzed": 15420,
    "modelVersion": "gpt-4-1106",
    "processingTime": 23.5,
    "confidence": 82,
    "sources": [
      "datadog_logs",
      "datadog_metrics",
      "kubernetes_events",
      "git_deployments",
      "vector_database"
    ]
  }
}
```

## Slack Response Format

```
Incident Analysis Complete

**Root Cause:** Database connection pool exhaustion in checkout-service
**Confidence:** 82%

**Evidence:**
• High frequency of connection timeout errors (datadog) - 347 occurrences
• Database connection utilization at 95% (datadog) - 90% deviation
• New version deployed 3 minutes before issues started (kubernetes)

**Immediate Actions:**
• Restart checkout-service (High Priority, Low Risk, 5 min)
  [Execute Now]
• Database Connection Pool Optimization (Medium Priority, Low Risk, 10 min)
  [View Runbook]

**Similar Incidents:** Found 2 similar incidents
• "Checkout service database connection issues" (14 days ago, 91% similar)
  Root cause: memory leak in service X
• "Payment service connection pool issues" (7 days ago, 78% similar)
  Root cause: connection pool configuration too low

**Timeline:**
10:12 - New version deployed (v2.3.1)
10:15 - High error rate detected
10:16 - Database connection pool exhaustion
10:17 - OpsSage analysis initiated

**Analysis Details:**
• Duration: 23.5 seconds
• Data Points Analyzed: 15,420
• Model: GPT-4
• Sources: Datadog, Kubernetes, Vector DB
```

## Teams Response Format

```json
{
  "type": "AdaptiveCard",
  "version": "1.5",
  "body": [
    {
      "type": "TextBlock",
      "text": "Incident Analysis Complete",
      "size": "large",
      "weight": "bolder",
      "color": "attention"
    },
    {
      "type": "TextBlock",
      "text": "**Root Cause:** Database connection pool exhaustion in checkout-service\n**Confidence:** 82%",
      "wrap": true
    },
    {
      "type": "FactSet",
      "facts": [
        {
          "title": "Service",
          "value": "checkout-service"
        },
        {
          "title": "Duration",
          "value": "23.5s"
        },
        {
          "title": "Data Points",
          "value": "15,420"
        }
      ]
    },
    {
      "type": "TextBlock",
      "text": "Evidence",
      "weight": "bolder",
      "spacing": "medium"
    },
    {
      "type": "TextBlock",
      "text": "• High frequency of connection timeout errors (347 occurrences)\n• Database connection utilization at 95%\n• Recent deployment may have introduced connection leak",
      "wrap": true,
      "spacing": "small"
    },
    {
      "type": "TextBlock",
      "text": "Recommendations",
      "weight": "bolder",
      "spacing": "medium"
    },
    {
      "type": "TextBlock",
      "text": "• **Restart checkout-service**: Immediate action, low risk\n• **Database Connection Pool Optimization**: Based on similar incidents\n• **Investigate v2.3.1**: Review for connection leaks",
      "wrap": true,
      "spacing": "small"
    },
    {
      "type": "TextBlock",
      "text": "Similar Incidents: 2 found",
      "weight": "bolder",
      "spacing": "medium"
    },
    {
      "type": "TextBlock",
      "text": "• Checkout service database connection issues (14 days ago, 91% similar)\n  Root cause: memory leak in service X",
      "wrap": true,
      "spacing": "small"
    }
  ],
  "actions": [
    {
      "type": "Action.Submit",
      "title": "Restart Service",
      "data": {
        "action": "execute",
        "recommendationId": "rec_001",
        "type": "recommendation"
      },
      "style": "destructive"
    },
    {
      "type": "Action.Submit",
      "title": "View Runbook",
      "data": {
        "action": "view",
        "runbookId": "rb_db_pool_config",
        "type": "runbook"
      },
      "style": "primary"
    },
    {
      "type": "Action.OpenUrl",
      "title": "Full Analysis",
      "url": "https://opssage.io/incidents/inc_123456789"
    }
  ]
}
```

## Key Features Demonstrated

### 1. **Similar Incident Detection**
- **"Similar incident 14 days ago. Root cause: memory leak in service X"**
- 91% similarity score with detailed breakdown
- Historical context and resolution patterns

### 2. **Multi-Source Data Correlation**
- **Datadog**: Logs, metrics, traces
- **Kubernetes**: Events, deployments, pod status
- **Git**: Recent deployment history
- **Vector Database**: Historical incident patterns

### 3. **AI-Powered Root Cause Analysis**
- **Hypothesis**: Database connection pool exhaustion
- **Confidence**: 82% with evidence-based scoring
- **Contributing Factors**: Recent deployment, increased traffic

### 4. **Actionable Recommendations**
- **Immediate Actions**: Restart service (auto-executable)
- **Runbook Suggestions**: Database pool optimization
- **Investigation Steps**: Code review for connection leaks

### 5. **Real-Time Timeline Generation**
- **Chronological Events**: Deployment → Alert → Analysis
- **Severity Indicators**: Info, Warning, Critical
- **Contextual Information**: Timestamps, descriptions

### 6. **ChatOps Integration**
- **Slack**: Rich formatting with interactive buttons
- **Teams**: Adaptive Cards with actions
- **Natural Language**: "Why is checkout service failing?"

## Production-Ready Features

### **Enterprise Security**
- RBAC and permission-based access
- API key and JWT authentication
- Data masking and PII protection
- Audit logging and compliance

### **Scalability**
- Horizontal pod autoscaling
- Multi-region deployment support
- Load balancing and traffic management
- Caching layers for performance

### **Reliability**
- Circuit breakers and retries
- Health checks and monitoring
- Graceful degradation
- Disaster recovery procedures

### **Observability**
- Prometheus metrics and Grafana dashboards
- Distributed tracing with OpenTelemetry
- Structured logging with Winston
- Alerting and notification systems

This comprehensive demonstration shows how OpsSage delivers on its promise of reducing MTTR through intelligent automation, historical context, and actionable insights during incidents.
