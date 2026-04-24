const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock data for demo
const mockIncidents = [
  {
    id: 'inc_123456789',
    title: 'Checkout service database connection issues',
    status: 'investigating',
    severity: 'high',
    service: 'checkout-service',
    createdAt: '2024-01-15T10:15:00Z',
    description: 'Database connection pool exhaustion in checkout-service',
    assignee: 'john.doe@company.com'
  },
  {
    id: 'inc_987654321',
    title: 'Payment service latency spikes',
    status: 'resolved',
    severity: 'medium',
    service: 'payment-service',
    createdAt: '2024-01-14T14:30:00Z',
    description: 'Increased response time in payment processing',
    assignee: 'jane.smith@company.com'
  }
];

const mockAnalysis = {
  incidentId: 'inc_123456789',
  query: 'Why is checkout service failing?',
  analysis: {
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
            samples: [
              '2024-01-15T10:15:23Z ERROR Connection timeout after 30s',
              '2024-01-15T10:15:24Z ERROR Connection timeout after 30s',
              '2024-01-15T10:15:25Z ERROR Connection timeout after 30s'
            ]
          }
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
            deviation: 90
          }
        }
      ]
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
          resolution: 89
        },
        metadata: {
          title: 'Checkout service database connection exhaustion',
          timestamp: '2024-01-01T14:30:00Z',
          service: 'checkout-service',
          severity: 'high',
          rootCause: 'Database connection pool exhaustion',
          resolution: 'Increased connection pool size and restarted service',
          duration: 45
        },
        snippet: 'Database connection timeout errors in checkout-service...',
        explanation: 'Similar incident 14 days ago. Root cause: memory leak in service X. Confidence: 91%'
      }
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
        reasoning: 'Service restart will clear connection pool and is low risk'
      },
      {
        id: 'rec_002',
        type: 'runbook',
        title: 'Database Connection Pool Optimization',
        description: 'Increase connection pool size and monitor for leaks',
        priority: 'medium',
        autoExecutable: true,
        runbookId: 'rb_db_pool_config',
        estimatedTime: 10,
        riskLevel: 'low',
        confidence: 85,
        reasoning: 'Based on similar incident resolution pattern'
      }
    ],
    timeline: [
      {
        timestamp: '2024-01-15T10:12:00Z',
        type: 'deployment',
        title: 'New version deployed',
        description: 'Checkout-service v2.3.1 deployed to production',
        severity: 'info'
      },
      {
        timestamp: '2024-01-15T10:15:00Z',
        type: 'alert_triggered',
        title: 'High error rate detected',
        description: 'Error rate exceeded 5% threshold in checkout-service',
        severity: 'warning'
      },
      {
        timestamp: '2024-01-15T10:16:30Z',
        type: 'metric_anomaly',
        title: 'Database connection pool exhaustion',
        description: 'Database connections at 95% capacity',
        severity: 'critical'
      },
      {
        timestamp: '2024-01-15T10:17:45Z',
        type: 'user_action',
        title: 'OpsSage analysis initiated',
        description: 'User requested incident analysis via Slack',
        severity: 'info'
      }
    ]
  },
  metadata: {
    analysisDuration: 23.5,
    dataPointsAnalyzed: 15420,
    modelVersion: 'gpt-4-1106',
    processingTime: 23.5,
    confidence: 82,
    sources: [
      'datadog_logs',
      'datadog_metrics',
      'kubernetes_events',
      'git_deployments',
      'vector_database'
    ]
  }
};

// API Routes
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    services: {
      'api-gateway': 'healthy',
      'incident-analysis': 'healthy',
      'data-collection': 'healthy',
      'ai-engine': 'healthy'
    }
  });
});

app.get('/api/v1/incidents', (req, res) => {
  const { status, severity, service, page = 1, limit = 10 } = req.query;
  
  let filteredIncidents = mockIncidents;
  
  if (status) {
    filteredIncidents = filteredIncidents.filter(inc => inc.status === status);
  }
  if (severity) {
    filteredIncidents = filteredIncidents.filter(inc => inc.severity === severity);
  }
  if (service) {
    filteredIncidents = filteredIncidents.filter(inc => inc.service === service);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex);
  
  res.json({
    incidents: paginatedIncidents,
    total: filteredIncidents.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredIncidents.length / limit)
  });
});

app.get('/api/v1/incidents/:id', (req, res) => {
  const incident = mockIncidents.find(inc => inc.id === req.params.id);
  
  if (!incident) {
    return res.status(404).json({
      error: 'Incident not found',
      code: 'INCIDENT_NOT_FOUND',
      message: `Incident with ID ${req.params.id} not found`
    });
  }
  
  res.json(incident);
});

app.post('/api/v1/incidents/analyze', (req, res) => {
  const { query, services, timeRange } = req.body;
  
  // Simulate processing time
  setTimeout(() => {
    res.json(mockAnalysis);
  }, 2000);
});

app.get('/api/v1/incidents/:id/similar', (req, res) => {
  const { limit = 5, minSimilarity = 70 } = req.query;
  
  // Return similar incidents based on our mock data
  const similarIncidents = mockAnalysis.similarIncidents
    .filter(inc => inc.similarity >= parseInt(minSimilarity))
    .slice(0, parseInt(limit));
  
  res.json({
    incidents: similarIncidents,
    total: similarIncidents.length,
    query: {
      limit: parseInt(limit),
      minSimilarity: parseInt(minSimilarity)
    }
  });
});

app.get('/api/v1/runbooks', (req, res) => {
  const runbooks = [
    {
      id: 'rb_db_pool_config',
      title: 'Database Connection Pool Optimization',
      description: 'Steps to optimize database connection pool configuration',
      steps: [
        'Check current connection pool settings',
        'Analyze connection usage patterns',
        'Increase max connections if needed',
        'Monitor for connection leaks',
        'Restart affected services'
      ],
      estimatedTime: 10,
      riskLevel: 'low',
      category: 'database'
    },
    {
      id: 'rb_service_restart',
      title: 'Service Restart Procedure',
      description: 'Safe service restart procedure',
      steps: [
        'Check service health status',
        'Drain traffic from service',
        'Restart service gracefully',
        'Verify service health',
        'Restore traffic'
      ],
      estimatedTime: 5,
      riskLevel: 'low',
      category: 'infrastructure'
    }
  ];
  
  res.json(runbooks);
});

app.get('/api/v1/metrics', (req, res) => {
  const metrics = {
    incidents: {
      total: 156,
      open: 12,
      investigating: 8,
      resolved: 136
    },
    performance: {
      avgResolutionTime: 45.2, // minutes
      mttr: 32.5, // minutes
      analysisAccuracy: 87.3 // percentage
    },
    services: {
      'checkout-service': {
        incidents: 23,
        avgResolutionTime: 38.5,
        health: 'degraded'
      },
      'payment-service': {
        incidents: 18,
        avgResolutionTime: 42.1,
        health: 'healthy'
      },
      'user-service': {
        incidents: 15,
        avgResolutionTime: 35.8,
        health: 'healthy'
      }
    }
  };
  
  res.json(metrics);
});

// Serve the demo web interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    code: 'NOT_FOUND',
    message: 'The requested resource was not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OpsSage Demo is running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api/v1/health`);
  console.log(`🎯 Demo Interface: http://localhost:${PORT}`);
});
