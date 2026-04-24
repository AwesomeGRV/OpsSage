# Data Models & Schemas

##  Overview

This document defines the complete data models used across OpsSage, including database schemas, API contracts, and internal data structures.

##  Core Data Models

### 1. Incident Model

```typescript
interface Incident {
  id: string;                    // UUID
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  service: string;
  environment: 'development' | 'staging' | 'production';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  
  // Assignment
  assignedTo?: string;           // User ID
  team?: string;                 // Team name
  
  // Impact
  impact: {
    usersAffected?: number;
    servicesAffected: string[];
    errorRate?: number;
    latencyIncrease?: number;
    revenueImpact?: number;
  };
  
  // Analysis Results
  rootCause?: RootCauseAnalysis;
  recommendations?: Recommendation[];
  similarIncidents?: SimilarIncident[];
  
  // Metadata
  tags: string[];
  source: 'slack' | 'teams' | 'web' | 'api';
  externalId?: string;           // PagerDuty/ServiceNow ID
  metadata: Record<string, any>;
}
```

### 2. Root Cause Analysis Model

```typescript
interface RootCauseAnalysis {
  hypothesis: string;
  confidence: number;           // 0-100
  evidence: EvidenceItem[];
  contributingFactors: ContributingFactor[];
  timeline: IncidentTimelineEvent[];
  
  // Classification
  category: 'performance' | 'availability' | 'security' | 'data' | 'infrastructure';
  subcategory: string;
  
  // AI Metadata
  modelVersion: string;
  analysisDuration: number;      // seconds
  dataPointsAnalyzed: number;
  
  // Verification
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

interface EvidenceItem {
  type: 'log_pattern' | 'metric_anomaly' | 'trace_error' | 'deployment' | 'configuration_change';
  description: string;
  source: string;                // datadog, kubernetes, etc.
  confidence: number;            // 0-100
  timestamp: Date;
  
  // Specific data based on type
  data: {
    // For log_pattern
    pattern?: string;
    count?: number;
    samples?: string[];
    
    // For metric_anomaly
    metric?: string;
    expectedValue?: number;
    actualValue?: number;
    deviation?: number;
    
    // For trace_error
    traceId?: string;
    spanId?: string;
    operation?: string;
    error?: string;
    
    // For deployment
    deploymentId?: string;
    version?: string;
    previousVersion?: string;
    
    // For configuration_change
    configKey?: string;
    oldValue?: any;
    newValue?: any;
  };
}

interface ContributingFactor {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  evidence: string[];
}
```

### 3. Recommendation Model

```typescript
interface Recommendation {
  id: string;
  type: 'immediate_action' | 'runbook' | 'investigation' | 'escalation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Execution
  autoExecutable: boolean;
  estimatedTime: number;         // minutes
  riskLevel: 'low' | 'medium' | 'high';
  
  // Runbook specific
  runbookId?: string;
  steps?: RunbookStep[];
  
  // Action specific
  command?: string;
  parameters?: Record<string, any>;
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  executedBy?: string;
  executedAt?: Date;
  result?: any;
  error?: string;
  
  // AI Confidence
  confidence: number;            // 0-100
  reasoning: string;
}

interface RunbookStep {
  order: number;
  title: string;
  description: string;
  command?: string;
  verification?: string;
  expectedOutput?: string;
  timeout?: number;              // seconds
  critical: boolean;             // Stop execution if failed
}
```

### 4. Similar Incident Model

```typescript
interface SimilarIncident {
  id: string;
  title: string;
  similarity: number;            // 0-100
  
  // Incident details
  timestamp: Date;
  service: string;
  severity: string;
  duration: number;              // minutes
  
  // Analysis
  rootCause: string;
  resolution: string;
  outcome: 'success' | 'partial' | 'failure';
  
  // Comparison details
  commonFactors: string[];
  differences: string[];
  
  // Effectiveness
  resolutionTime: number;
  userSatisfaction?: number;     // 1-5
  
  // Metadata
  tags: string[];
  environment: string;
}
```

## 🗄️ Database Schemas

### PostgreSQL Schema

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    team VARCHAR(100),
    permissions JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE
);

-- Incidents Table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    service VARCHAR(100) NOT NULL,
    environment VARCHAR(20) NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    team VARCHAR(100),
    
    -- Impact
    impact JSONB DEFAULT '{}',
    
    -- Analysis
    root_cause JSONB,
    ai_metadata JSONB DEFAULT '{}',
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    source VARCHAR(20) NOT NULL,
    external_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT incidents_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT incidents_status_check CHECK (status IN ('open', 'investigating', 'resolved', 'closed'))
);

-- Root Causes Table
CREATE TABLE root_causes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    hypothesis TEXT NOT NULL,
    confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    category VARCHAR(50),
    subcategory VARCHAR(100),
    evidence JSONB DEFAULT '[]',
    contributing_factors JSONB DEFAULT '[]',
    model_version VARCHAR(50),
    analysis_duration DECIMAL(10,3),
    data_points_analyzed INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendations Table
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Execution
    auto_executable BOOLEAN DEFAULT FALSE,
    estimated_time INTEGER,
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
    
    -- Runbook
    runbook_id UUID REFERENCES runbooks(id),
    steps JSONB DEFAULT '[]',
    
    -- Action
    command TEXT,
    parameters JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    executed_by UUID REFERENCES users(id),
    executed_at TIMESTAMP WITH TIME ZONE,
    result JSONB,
    error TEXT,
    
    -- AI
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    reasoning TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Runbooks Table
CREATE TABLE runbooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    steps JSONB NOT NULL DEFAULT '[]',
    auto_executable BOOLEAN DEFAULT FALSE,
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
    estimated_time INTEGER,
    prerequisites JSONB DEFAULT '[]',
    verification_steps JSONB DEFAULT '[]',
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES runbooks(id),
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

-- Incident Timeline Table
CREATE TABLE incident_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    source VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Similar Incidents Cache Table
CREATE TABLE similar_incidents_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    similar_incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    similarity_score INTEGER NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 100),
    common_factors TEXT[] DEFAULT '{}',
    differences TEXT[] DEFAULT '{}',
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(incident_id, similar_incident_id)
);

-- Indexes
CREATE INDEX idx_incidents_service_severity ON incidents(service, severity);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX idx_root_causes_incident_id ON root_causes(incident_id);
CREATE INDEX idx_recommendations_incident_id ON recommendations(incident_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_incident_timeline_incident_timestamp ON incident_timeline(incident_id, timestamp DESC);
CREATE INDEX idx_similar_incidents_cache_incident ON similar_incidents_cache(incident_id);
CREATE INDEX idx_similar_incidents_cache_score ON similar_incidents_cache(similarity_score DESC);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_runbooks_updated_at BEFORE UPDATE ON runbooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Vector Database Schema (Pinecone)

```typescript
interface IncidentVectorMetadata {
  incidentId: string;
  title: string;
  service: string;
  severity: string;
  category: string;
  timestamp: number;
  rootCause: string;
  resolution: string;
  tags: string[];
  environment: string;
  duration: number;
  impact: {
    usersAffected?: number;
    errorRate?: number;
  };
}

interface IncidentVector {
  id: string;                    // incident UUID
  values: number[];             // 1536-dimensional embedding
  metadata: IncidentVectorMetadata;
}
```

### Redis Cache Schemas

```typescript
// Session Cache
interface SessionCache {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  lastActivity: Date;
}

// Incident Analysis Cache
interface AnalysisCache {
  incidentId: string;
  analysis: RootCauseAnalysis;
  recommendations: Recommendation[];
  similarIncidents: SimilarIncident[];
  cachedAt: Date;
  ttl: number;                  // seconds
}

// Rate Limiting
interface RateLimit {
  key: string;                  // user:endpoint
  count: number;
  windowStart: Date;
  ttl: number;
}

// Real-time Metrics
interface RealTimeMetrics {
  service: string;
  timestamp: Date;
  metrics: {
    errorRate: number;
    latency: number;
    throughput: number;
    cpu: number;
    memory: number;
  };
}
```

##  Event Models

### Internal Events

```typescript
interface IncidentEvent {
  id: string;
  type: 'incident.created' | 'incident.updated' | 'incident.resolved' | 'incident.assigned';
  data: {
    incident: Incident;
    changes?: Partial<Incident>;
    previousValues?: Partial<Incident>;
  };
  timestamp: Date;
  userId?: string;
  source: string;
}

interface AnalysisEvent {
  id: string;
  type: 'analysis.started' | 'analysis.completed' | 'analysis.failed';
  data: {
    incidentId: string;
    analysisId?: string;
    duration?: number;
    result?: RootCauseAnalysis;
    error?: string;
  };
  timestamp: Date;
}

interface RecommendationEvent {
  id: string;
  type: 'recommendation.created' | 'recommendation.executed' | 'recommendation.failed';
  data: {
    incidentId: string;
    recommendationId: string;
    result?: any;
    error?: string;
  };
  timestamp: Date;
  userId?: string;
}
```

### External Integration Events

```typescript
// PagerDuty Integration
interface PagerDutyEvent {
  type: 'incident.triggered' | 'incident.acknowledged' | 'incident.resolved';
  data: {
    incident_id: string;
    title: string;
    severity: string;
    status: string;
    assigned_to?: string;
    created_at: string;
    updated_at: string;
  };
}

// Slack Integration
interface SlackEvent {
  type: 'message' | 'command' | 'interaction';
  data: {
    user_id: string;
    channel_id: string;
    team_id: string;
    text: string;
    timestamp: string;
  };
}

// Kubernetes Events
interface KubernetesEvent {
  type: 'pod.created' | 'pod.deleted' | 'deployment.updated' | 'service.updated';
  data: {
    namespace: string;
    resource_type: string;
    resource_name: string;
    reason: string;
    message: string;
    timestamp: string;
  };
}
```

##  Analytics Models

### Incident Metrics

```typescript
interface IncidentMetrics {
  timeRange: {
    start: Date;
    end: Date;
  };
  
  // Volume metrics
  totalIncidents: number;
  incidentsBySeverity: Record<string, number>;
  incidentsByService: Record<string, number>;
  incidentsByEnvironment: Record<string, number>;
  
  // Time metrics
  mttr: number;                 // Mean Time To Resolution
  mttD: number;                 // Mean Time To Detection
  mttA: number;                 // Mean Time To Acknowledgment
  
  // AI Performance
  analysisAccuracy: number;
  recommendationEffectiveness: number;
  falsePositiveRate: number;
  
  // User metrics
  userSatisfaction: number;
  adoptionRate: number;
  timeSaved: number;            // minutes saved per incident
}

interface ServiceHealthMetrics {
  service: string;
  environment: string;
  timestamp: Date;
  
  // Performance metrics
  errorRate: number;
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: number;
  
  // Resource metrics
  cpu: number;
  memory: number;
  disk: number;
  
  // Business metrics
  availability: number;
  userSatisfaction: number;
  revenueImpact: number;
}
```

##  Search Models

### Search Query

```typescript
interface SearchQuery {
  query?: string;                // Text search
  filters: {
    services?: string[];
    severities?: string[];
    environments?: string[];
    timeRange?: {
      start: Date;
      end: Date;
    };
    tags?: string[];
    categories?: string[];
    users?: string[];
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
  };
  facets?: string[];             // Fields to return facet counts for
}
```

### Search Results

```typescript
interface SearchResults<T> {
  hits: SearchResult<T>[];
  total: number;
  took: number;                  // milliseconds
  facets?: Record<string, FacetResult>;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

interface SearchResult<T> {
  item: T;
  score: number;
  highlights?: Record<string, string[]>;
}

interface FacetResult {
  buckets: Array<{
    key: string;
    count: number;
  }>;
  total: number;
}
```

## 🛡️ Security Models

### User Permissions

```typescript
interface Permission {
  resource: string;              // incidents, runbooks, users
  action: string;                // read, write, delete, execute
  scope?: string;               // service:checkout-service, team:sre
}

interface Role {
  name: string;
  permissions: Permission[];
  inherits?: string[];           // Parent roles
}

// Predefined roles
const ROLES = {
  VIEWER: {
    permissions: [
      { resource: 'incidents', action: 'read' },
      { resource: 'runbooks', action: 'read' }
    ]
  },
  ENGINEER: {
    permissions: [
      { resource: 'incidents', action: 'read' },
      { resource: 'incidents', action: 'write' },
      { resource: 'runbooks', action: 'read' },
      { resource: 'runbooks', action: 'execute' }
    ]
  },
  SRE: {
    permissions: [
      { resource: 'incidents', action: 'read' },
      { resource: 'incidents', action: 'write' },
      { resource: 'incidents', action: 'delete' },
      { resource: 'runbooks', action: 'read' },
      { resource: 'runbooks', action: 'write' },
      { resource: 'runbooks', action: 'execute' },
      { resource: 'users', action: 'read' }
    ]
  },
  ADMIN: {
    permissions: [
      { resource: '*', action: '*' }
    ]
  }
};
```

### Audit Log

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: {
    before?: any;
    after?: any;
    ip?: string;
    userAgent?: string;
  };
  timestamp: Date;
  result: 'success' | 'failure';
  error?: string;
}
```
