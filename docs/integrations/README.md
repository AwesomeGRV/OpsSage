# Integration Examples

##  Overview

This document provides comprehensive integration examples for connecting OpsSage with various data sources, monitoring systems, and communication platforms.

## Data Source Integrations

### 1. Datadog Integration

#### Configuration

```typescript
// src/integrations/datadog/datadog.config.ts
export interface DatadogConfig {
  apiKey: string;
  appKey: string;
  site: string; // 'datadoghq.com', 'datadoghq.eu', etc.
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const datadogConfig: DatadogConfig = {
  apiKey: process.env.DATADOG_API_KEY!,
  appKey: process.env.DATADOG_APP_KEY!,
  site: process.env.DATADOG_SITE || 'datadoghq.com',
  baseUrl: `https://api.${process.env.DATADOG_SITE || 'datadoghq.com'}`,
  timeout: 30000,
  retryAttempts: 3
};
```

#### Logs Collection

```typescript
// src/integrations/datadog/logs.collector.ts
import { DatadogConfig } from './datadog.config';

export class DatadogLogsCollector {
  private config: DatadogConfig;
  private httpClient: HttpClient;

  constructor(config: DatadogConfig) {
    this.config = config;
    this.httpClient = new HttpClient({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'DD-API-KEY': config.apiKey,
        'DD-APPLICATION-KEY': config.appKey
      }
    });
  }

  async getLogs(params: LogsQueryParams): Promise<DatadogLogsResponse> {
    const query = this.buildLogsQuery(params);
    
    try {
      const response = await this.httpClient.post('/api/v2/logs/events/search', {
        filter: {
          query,
          from: params.timeRange.start.toISOString(),
          to: params.timeRange.end.toISOString()
        },
        sort: '-timestamp',
        page: {
          limit: params.limit || 1000
        },
        include: ['attributes']
      });

      return this.transformLogsResponse(response.data);
    } catch (error) {
      throw new DatadogIntegrationError('Failed to fetch logs', error);
    }
  }

  async getErrorPatterns(service: string, timeRange: TimeRange): Promise<ErrorPattern[]> {
    const logs = await this.getLogs({
      services: [service],
      statuses: ['error', 'critical'],
      timeRange,
      limit: 1000
    });

    return this.analyzeErrorPatterns(logs.data);
  }

  private buildLogsQuery(params: LogsQueryParams): string {
    const queryParts = [];

    if (params.services?.length) {
      queryParts.push(`service:(${params.services.join(' OR ')})`);
    }

    if (params.statuses?.length) {
      queryParts.push(`status:(${params.statuses.join(' OR ')})`);
    }

    if (params.environments?.length) {
      queryParts.push(`env:(${params.environments.join(' OR ')})`);
    }

    if (params.keywords?.length) {
      queryParts.push(`(${params.keywords.join(' AND ')})`);
    }

    return queryParts.join(' AND ');
  }

  private analyzeErrorPatterns(logs: DatadogLog[]): ErrorPattern[] {
    const errorMessages = logs
      .map(log => log.attributes.message)
      .filter(msg => msg.includes('error') || msg.includes('exception'));

    const patterns = this.extractCommonPatterns(errorMessages);
    
    return patterns.map(pattern => ({
      pattern: pattern.text,
      count: pattern.count,
      frequency: pattern.count / logs.length,
      samples: pattern.samples,
      severity: this.determineSeverity(pattern.text)
    }));
  }

  private extractCommonPatterns(messages: string[]): Array<{text: string, count: number, samples: string[]}> {
    // Implement pattern extraction algorithm
    const patterns = new Map<string, {count: number, samples: string[]}>();
    
    messages.forEach(message => {
      const normalized = this.normalizeErrorMessage(message);
      const existing = patterns.get(normalized);
      
      if (existing) {
        existing.count++;
        if (existing.samples.length < 3) {
          existing.samples.push(message);
        }
      } else {
        patterns.set(normalized, {
          count: 1,
          samples: [message]
        });
      }
    });

    return Array.from(patterns.entries())
      .map(([text, data]) => ({ text, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private normalizeErrorMessage(message: string): string {
    // Remove timestamps, IDs, and variable values
    return message
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, '[TIMESTAMP]')
      .replace(/\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi, '[UUID]')
      .replace(/\b\d+\b/g, '[NUMBER]')
      .trim();
  }
}

interface LogsQueryParams {
  services?: string[];
  statuses?: string[];
  environments?: string[];
  keywords?: string[];
  timeRange: TimeRange;
  limit?: number;
}

interface DatadogLogsResponse {
  data: DatadogLog[];
  meta: {
    page: {
      total_count: number;
    };
  };
}

interface DatadogLog {
  id: string;
  attributes: {
    timestamp: string;
    message: string;
    status: string;
    service: string;
    env: string;
    host: string;
    tags: string[];
  };
}
```

#### Metrics Collection

```typescript
// src/integrations/datadog/metrics.collector.ts
export class DatadogMetricsCollector {
  private config: DatadogConfig;
  private httpClient: HttpClient;

  constructor(config: DatadogConfig) {
    this.config = config;
    this.httpClient = new HttpClient({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'DD-API-KEY': config.apiKey,
        'DD-APPLICATION-KEY': config.appKey
      }
    });
  }

  async getMetrics(params: MetricsQueryParams): Promise<DatadogMetricsResponse> {
    const queries = this.buildMetricQueries(params);
    
    try {
      const response = await this.httpClient.post('/api/v1/query', {
        queries: queries.map(query => ({
          query,
          from: params.timeRange.start.getTime() / 1000,
          to: params.timeRange.end.getTime() / 1000,
          format: 'timeseries'
        }))
      });

      return this.transformMetricsResponse(response.data);
    } catch (error) {
      throw new DatadogIntegrationError('Failed to fetch metrics', error);
    }
  }

  async detectAnomalies(service: string, timeRange: TimeRange): Promise<MetricAnomaly[]> {
    const metrics = await this.getMetrics({
      services: [service],
      metrics: ['error_rate', 'latency', 'throughput', 'cpu', 'memory'],
      timeRange
    });

    return this.analyzeMetricsForAnomalies(metrics);
  }

  private buildMetricQueries(params: MetricsQueryParams): string[] {
    const queries: string[] = [];

    params.metrics?.forEach(metric => {
      if (params.services?.length) {
        params.services.forEach(service => {
          queries.push(`${metric}{service:${service}}`);
        });
      } else {
        queries.push(metric);
      }
    });

    return queries;
  }

  private analyzeMetricsForAnomalies(metrics: DatadogMetricsResponse): MetricAnomaly[] {
    const anomalies: MetricAnomaly[] = [];

    metrics.series.forEach(series => {
      const values = series.pointlist.map(point => point[1]);
      const anomaly = this.detectAnomalyInSeries(values, series.metric);
      
      if (anomaly) {
        anomalies.push({
          metric: series.metric,
          service: series.tags.find(tag => tag.startsWith('service:'))?.replace('service:', ''),
          anomaly: anomaly.type,
          severity: anomaly.severity,
          expectedValue: anomaly.expectedValue,
          actualValue: anomaly.actualValue,
          deviation: anomaly.deviation,
          timestamp: new Date(anomaly.timestamp * 1000)
        });
      }
    });

    return anomalies;
  }

  private detectAnomalyInSeries(values: number[], metricName: string): AnomalyResult | null {
    if (values.length < 10) return null;

    // Use statistical methods to detect anomalies
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
    
    // Look for values beyond 2 standard deviations
    const threshold = 2 * stdDev;
    
    for (let i = 0; i < values.length; i++) {
      const deviation = Math.abs(values[i] - mean);
      if (deviation > threshold) {
        return {
          type: deviation > 3 * stdDev ? 'critical' : 'warning',
          severity: deviation > 3 * stdDev ? 'high' : 'medium',
          expectedValue: mean,
          actualValue: values[i],
          deviation: deviation / stdDev,
          timestamp: Date.now() - (values.length - i) * 60000 // Assuming 1-minute intervals
        };
      }
    }

    return null;
  }
}

interface MetricsQueryParams {
  services?: string[];
  metrics?: string[];
  timeRange: TimeRange;
  aggregation?: 'avg' | 'sum' | 'min' | 'max';
}

interface MetricAnomaly {
  metric: string;
  service?: string;
  anomaly: 'warning' | 'critical';
  severity: 'low' | 'medium' | 'high';
  expectedValue: number;
  actualValue: number;
  deviation: number;
  timestamp: Date;
}
```

#### Traces Collection

```typescript
// src/integrations/datadog/traces.collector.ts
export class DatadogTracesCollector {
  private config: DatadogConfig;
  private httpClient: HttpClient;

  constructor(config: DatadogConfig) {
    this.config = config;
    this.httpClient = new HttpClient({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'DD-API-KEY': config.apiKey,
        'DD-APPLICATION-KEY': config.appKey
      }
    });
  }

  async getTraces(params: TracesQueryParams): Promise<DatadogTracesResponse> {
    const query = this.buildTracesQuery(params);
    
    try {
      const response = await this.httpClient.get('/api/v1/traces/search', {
        params: {
          query,
          from: params.timeRange.start.getTime() / 1000,
          to: params.timeRange.end.getTime() / 1000,
          limit: params.limit || 1000
        }
      });

      return this.transformTracesResponse(response.data);
    } catch (error) {
      throw new DatadogIntegrationError('Failed to fetch traces', error);
    }
  }

  async getErrorTraces(service: string, timeRange: TimeRange): Promise<ErrorTrace[]> {
    const traces = await this.getTraces({
      services: [service],
      status: 'error',
      timeRange,
      limit: 500
    });

    return this.analyzeErrorTraces(traces.data);
  }

  async getPerformanceBottlenecks(service: string, timeRange: TimeRange): Promise<Bottleneck[]> {
    const traces = await this.getTraces({
      services: [service],
      timeRange,
      limit: 1000
    });

    return this.identifyBottlenecks(traces.data);
  }

  private analyzeErrorTraces(traces: DatadogTrace[]): ErrorTrace[] {
    return traces.map(trace => {
      const errorSpans = trace.spans.filter(span => span.error);
      
      return {
        traceId: trace.trace_id,
        timestamp: new Date(trace.start * 1000),
        duration: trace.duration,
        service: trace.service,
        operation: trace.name,
        errorCount: errorSpans.length,
        errors: errorSpans.map(span => ({
          spanId: span.span_id,
          operation: span.name,
          error: span.error,
          resource: span.resource,
          stackTrace: span.meta?.['error.stack']
        })),
        impact: this.calculateErrorImpact(trace)
      };
    });
  }

  private identifyBottlenecks(traces: DatadogTrace[]): Bottleneck[] {
    const serviceMetrics = new Map<string, ServiceMetrics>();

    traces.forEach(trace => {
      trace.spans.forEach(span => {
        const service = span.service;
        const existing = serviceMetrics.get(service) || {
          totalDuration: 0,
          spanCount: 0,
          errorCount: 0,
          maxDuration: 0
        };

        existing.totalDuration += span.duration;
        existing.spanCount++;
        existing.maxDuration = Math.max(existing.maxDuration, span.duration);
        if (span.error) existing.errorCount++;

        serviceMetrics.set(service, existing);
      });
    });

    const bottlenecks: Bottleneck[] = [];

    serviceMetrics.forEach((metrics, service) => {
      const avgDuration = metrics.totalDuration / metrics.spanCount;
      const errorRate = metrics.errorCount / metrics.spanCount;

      if (avgDuration > 5000 || errorRate > 0.1) { // 5s or 10% error rate
        bottlenecks.push({
          service,
          avgDuration,
          maxDuration: metrics.maxDuration,
          errorRate,
          severity: avgDuration > 10000 || errorRate > 0.2 ? 'high' : 'medium',
          recommendation: this.getBottleneckRecommendation(service, avgDuration, errorRate)
        });
      }
    });

    return bottlenecks;
  }

  private getBottleneckRecommendation(service: string, avgDuration: number, errorRate: number): string {
    if (avgDuration > 10000) {
      return `High latency detected in ${service}. Consider optimizing database queries or adding caching.`;
    }
    if (errorRate > 0.2) {
      return `High error rate in ${service}. Check for resource exhaustion or external service issues.`;
    }
    return `Performance degradation in ${service}. Review recent deployments and configuration changes.`;
  }
}

interface TracesQueryParams {
  services?: string[];
  status?: string;
  timeRange: TimeRange;
  limit?: number;
}

interface ErrorTrace {
  traceId: string;
  timestamp: Date;
  duration: number;
  service: string;
  operation: string;
  errorCount: number;
  errors: Array<{
    spanId: string;
    operation: string;
    error: number;
    resource: string;
    stackTrace?: string;
  }>;
  impact: 'low' | 'medium' | 'high';
}

interface Bottleneck {
  service: string;
  avgDuration: number;
  maxDuration: number;
  errorRate: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}
```

### 2. Kubernetes Integration

#### Configuration

```typescript
// src/integrations/kubernetes/kubernetes.config.ts
export interface KubernetesConfig {
  kubeconfig?: string;
  namespace?: string;
  baseUrl?: string;
  token?: string;
  caCert?: string;
  timeout: number;
}

export const kubernetesConfig: KubernetesConfig = {
  namespace: process.env.K8S_NAMESPACE || 'default',
  timeout: 30000
};
```

#### Events Collection

```typescript
// src/integrations/kubernetes/events.collector.ts
import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';

export class KubernetesEventsCollector {
  private k8sApi: CoreV1Api;
  private namespace: string;

  constructor(config: KubernetesConfig) {
    const kc = new KubeConfig();
    
    if (config.kubeconfig) {
      kc.loadFromFile(config.kubeconfig);
    } else {
      kc.loadFromDefault();
    }

    this.k8sApi = kc.makeApiClient(CoreV1Api);
    this.namespace = config.namespace || 'default';
  }

  async getEvents(params: EventsQueryParams): Promise<KubernetesEvent[]> {
    try {
      const response = await this.k8sApi.listNamespacedEvent(
        this.namespace,
        undefined,
        undefined,
        undefined,
        params.fieldSelector,
        params.labelSelector
      );

      return this.transformEventsResponse(response.body.items);
    } catch (error) {
      throw new KubernetesIntegrationError('Failed to fetch events', error);
    }
  }

  async getRecentEvents(service: string, hours: number = 24): Promise<KubernetesEvent[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const events = await this.getEvents({
      fieldSelector: `involvedObject.name=${service},lastTimestamp>${since.toISOString()}`
    });

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getProblematicEvents(service?: string): Promise<ProblematicEvent[]> {
    const events = await this.getEvents({
      fieldSelector: service ? `involvedObject.name=${service}` : undefined
    });

    const problematicEvents = events.filter(event => 
      event.type === 'Warning' || 
      event.reason.includes('Error') ||
      event.reason.includes('Failed') ||
      event.reason.includes('Killing')
    );

    return this.analyzeProblematicEvents(problematicEvents);
  }

  private transformEventsResponse(items: any[]): KubernetesEvent[] {
    return items.map(item => ({
      name: item.metadata.name,
      namespace: item.metadata.namespace,
      timestamp: new Date(item.lastTimestamp || item.eventTime),
      type: item.type,
      reason: item.reason,
      message: item.message,
      involvedObject: {
        kind: item.involvedObject?.kind,
        name: item.involvedObject?.name,
        namespace: item.involvedObject?.namespace
      },
      source: item.source?.component,
      count: item.count || 1
    }));
  }

  private analyzeProblematicEvents(events: KubernetesEvent[]): ProblematicEvent[] {
    const eventGroups = new Map<string, KubernetesEvent[]>();

    events.forEach(event => {
      const key = `${event.reason}:${event.involvedObject?.name}`;
      const existing = eventGroups.get(key) || [];
      existing.push(event);
      eventGroups.set(key, existing);
    });

    return Array.from(eventGroups.entries()).map(([key, events]) => ({
      reason: events[0].reason,
      object: events[0].involvedObject,
      count: events.reduce((sum, event) => sum + event.count, 0),
      firstOccurrence: events[0].timestamp,
      lastOccurrence: events[events.length - 1].timestamp,
      frequency: this.calculateFrequency(events),
      severity: this.determineSeverity(events[0].reason),
      samples: events.slice(0, 3).map(e => e.message),
      recommendation: this.getEventRecommendation(events[0].reason)
    }));
  }

  private calculateFrequency(events: KubernetesEvent[]): number {
    if (events.length < 2) return 0;
    
    const timeSpan = events[events.length - 1].timestamp.getTime() - events[0].timestamp.getTime();
    return events.length / (timeSpan / (1000 * 60 * 60)); // events per hour
  }

  private determineSeverity(reason: string): 'low' | 'medium' | 'high' {
    const highSeverityReasons = ['Killing', 'OOMKilling', 'FailedMount', 'CrashLoopBackOff'];
    const mediumSeverityReasons = ['BackOff', 'Unhealthy', 'Failed'];
    
    if (highSeverityReasons.some(r => reason.includes(r))) return 'high';
    if (mediumSeverityReasons.some(r => reason.includes(r))) return 'medium';
    return 'low';
  }

  private getEventRecommendation(reason: string): string {
    const recommendations: Record<string, string> = {
      'Killing': 'Pod is being terminated. Check resource limits and pod health.',
      'OOMKilling': 'Out of memory error. Increase memory limits or optimize memory usage.',
      'FailedMount': 'Volume mount failed. Check PVC status and storage configuration.',
      'CrashLoopBackOff': 'Pod is crashing repeatedly. Check application logs and configuration.',
      'BackOff': 'Container is failing to start. Check image and configuration.',
      'Unhealthy': 'Health check failing. Review health check endpoints and thresholds.'
    };

    return recommendations[reason] || 'Review pod logs and configuration for issues.';
  }
}

interface EventsQueryParams {
  fieldSelector?: string;
  labelSelector?: string;
}

interface KubernetesEvent {
  name: string;
  namespace: string;
  timestamp: Date;
  type: string;
  reason: string;
  message: string;
  involvedObject: {
    kind?: string;
    name?: string;
    namespace?: string;
  };
  source?: string;
  count: number;
}

interface ProblematicEvent {
  reason: string;
  object: any;
  count: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  samples: string[];
  recommendation: string;
}
```

#### Pod Status Collection

```typescript
// src/integrations/kubernetes/pods.collector.ts
export class KubernetesPodsCollector {
  private k8sApi: CoreV1Api;
  private namespace: string;

  constructor(config: KubernetesConfig) {
    const kc = new KubeConfig();
    kc.loadFromDefault();
    this.k8sApi = kc.makeApiClient(CoreV1Api);
    this.namespace = config.namespace || 'default';
  }

  async getPods(service?: string): Promise<PodInfo[]> {
    try {
      const labelSelector = service ? `app=${service}` : undefined;
      const response = await this.k8sApi.listNamespacedPod(
        this.namespace,
        undefined,
        undefined,
        undefined,
        undefined,
        labelSelector
      );

      return this.transformPodsResponse(response.body.items);
    } catch (error) {
      throw new KubernetesIntegrationError('Failed to fetch pods', error);
    }
  }

  async getPodHealth(service: string): Promise<PodHealth> {
    const pods = await this.getPods(service);
    
    const running = pods.filter(pod => pod.status === 'Running');
    const failed = pods.filter(pod => pod.status === 'Failed' || pod.status === 'Error');
    const pending = pods.filter(pod => pod.status === 'Pending');
    const crashing = pods.filter(pod => pod.restartCount > 0);

    return {
      service,
      totalPods: pods.length,
      runningPods: running.length,
      failedPods: failed.length,
      pendingPods: pending.length,
      crashingPods: crashing.length,
      healthScore: this.calculateHealthScore(running.length, failed.length, pending.length, crashing.length),
      issues: this.identifyHealthIssues(pods),
      recommendations: this.getHealthRecommendations(pods)
    };
  }

  private transformPodsResponse(items: any[]): PodInfo[] {
    return items.map(item => ({
      name: item.metadata.name,
      namespace: item.metadata.namespace,
      status: item.status.phase,
      podIP: item.status.podIP,
      nodeName: item.spec.nodeName,
      startTime: item.status.startTime ? new Date(item.status.startTime) : undefined,
      restartCount: item.status.containerStatuses?.reduce((sum, container) => sum + container.restartCount, 0) || 0,
      ready: item.status.containerStatuses?.every(container => container.ready) || false,
      conditions: item.status.conditions?.map(condition => ({
        type: condition.type,
        status: condition.status,
        reason: condition.reason,
        message: condition.message
      })) || [],
      labels: item.metadata.labels || {},
      events: []
    }));
  }

  private calculateHealthScore(running: number, failed: number, pending: number, crashing: number): number {
    const total = running + failed + pending + crashing;
    if (total === 0) return 0;
    
    let score = (running / total) * 100;
    
    // Penalize for failed pods
    score -= (failed / total) * 50;
    
    // Penalize for crashing pods
    score -= (crashing / total) * 25;
    
    // Slightly penalize for pending pods
    score -= (pending / total) * 10;
    
    return Math.max(0, Math.round(score));
  }

  private identifyHealthIssues(pods: PodInfo[]): HealthIssue[] {
    const issues: HealthIssue[] = [];

    pods.forEach(pod => {
      if (pod.status === 'Failed' || pod.status === 'Error') {
        issues.push({
          type: 'pod_failure',
          severity: 'high',
          pod: pod.name,
          description: `Pod ${pod.name} is in ${pod.status} state`,
          recommendation: 'Check pod logs and configuration'
        });
      }

      if (pod.restartCount > 5) {
        issues.push({
          type: 'crash_loop',
          severity: 'medium',
          pod: pod.name,
          description: `Pod ${pod.name} has restarted ${pod.restartCount} times`,
          recommendation: 'Investigate application crashes and resource limits'
        });
      }

      if (pod.status === 'Pending') {
        issues.push({
          type: 'pending_pod',
          severity: 'medium',
          pod: pod.name,
          description: `Pod ${pod.name} is stuck in Pending state`,
          recommendation: 'Check resource quotas, node availability, and PVC status'
        });
      }

      const notReadyCondition = pod.conditions.find(c => c.type === 'Ready' && c.status !== 'True');
      if (notReadyCondition) {
        issues.push({
          type: 'not_ready',
          severity: 'medium',
          pod: pod.name,
          description: `Pod ${pod.name} is not ready: ${notReadyCondition.reason}`,
          recommendation: notReadyCondition.message || 'Check pod health and dependencies'
        });
      }
    });

    return issues;
  }

  private getHealthRecommendations(pods: PodInfo[]): string[] {
    const recommendations: string[] = [];
    const failedCount = pods.filter(p => p.status === 'Failed' || p.status === 'Error').length;
    const crashingCount = pods.filter(p => p.restartCount > 0).length;
    const pendingCount = pods.filter(p => p.status === 'Pending').length;

    if (failedCount > 0) {
      recommendations.push(`Investigate ${failedCount} failed pod(s) - check logs and configuration`);
    }

    if (crashingCount > 0) {
      recommendations.push(`${crashingCount} pod(s) are crashing - review application code and resource limits`);
    }

    if (pendingCount > 0) {
      recommendations.push(`${pendingCount} pod(s) are pending - check resource availability and quotas`);
    }

    if (pods.length === 0) {
      recommendations.push('No pods found - check deployment configuration and resource quotas');
    }

    return recommendations;
  }
}

interface PodInfo {
  name: string;
  namespace: string;
  status: string;
  podIP?: string;
  nodeName?: string;
  startTime?: Date;
  restartCount: number;
  ready: boolean;
  conditions: Array<{
    type: string;
    status: string;
    reason?: string;
    message?: string;
  }>;
  labels: Record<string, string>;
  events: string[];
}

interface PodHealth {
  service: string;
  totalPods: number;
  runningPods: number;
  failedPods: number;
  pendingPods: number;
  crashingPods: number;
  healthScore: number;
  issues: HealthIssue[];
  recommendations: string[];
}

interface HealthIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  pod: string;
  description: string;
  recommendation: string;
}
```

### 3. PagerDuty Integration

#### Configuration

```typescript
// src/integrations/pagerduty/pagerduty.config.ts
export interface PagerDutyConfig {
  apiToken: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const pagerDutyConfig: PagerDutyConfig = {
  apiToken: process.env.PAGERDUTY_API_TOKEN!,
  baseUrl: 'https://api.pagerduty.com',
  timeout: 30000,
  retryAttempts: 3
};
```

#### Incident Collection

```typescript
// src/integrations/pagerduty/incidents.collector.ts
export class PagerDutyIncidentsCollector {
  private config: PagerDutyConfig;
  private httpClient: HttpClient;

  constructor(config: PagerDutyConfig) {
    this.config = config;
    this.httpClient = new HttpClient({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Authorization': `Token token=${config.apiToken}`,
        'Accept': 'application/vnd.pagerduty+json;version=2'
      }
    });
  }

  async getIncidents(params: IncidentsQueryParams): Promise<PagerDutyIncidentsResponse> {
    try {
      const response = await this.httpClient.get('/incidents', {
        params: {
          since: params.timeRange?.start?.toISOString(),
          until: params.timeRange?.end?.toISOString(),
          statuses: params.statuses?.join(','),
          urgencies: params.urgencies?.join(','),
          limit: params.limit || 100
        }
      });

      return this.transformIncidentsResponse(response.data);
    } catch (error) {
      throw new PagerDutyIntegrationError('Failed to fetch incidents', error);
    }
  }

  async getIncidentTimeline(incidentId: string): Promise<IncidentTimelineEntry[]> {
    try {
      const response = await this.httpClient.get(`/incidents/${incidentId}/timeline`, {
        params: {
          limit: 100
        }
      });

      return this.transformTimelineResponse(response.data.timeline_entries);
    } catch (error) {
      throw new PagerDutyIntegrationError('Failed to fetch incident timeline', error);
    }
  }

  async getSimilarIncidents(service: string, timeRange: TimeRange): Promise<SimilarIncident[]> {
    const incidents = await this.getIncidents({
      timeRange,
      service
    });

    return incidents.incidents
      .filter(incident => incident.service === service)
      .map(incident => ({
        id: incident.id,
        title: incident.title,
        severity: incident.urgency,
        status: incident.status,
        createdAt: incident.createdAt,
        resolvedAt: incident.resolvedAt,
        duration: incident.duration,
        service: incident.service,
        summary: incident.summary
      }));
  }

  private transformIncidentsResponse(data: any): PagerDutyIncidentsResponse {
    return {
      incidents: data.incidents.map(this.transformIncident),
      total: data.total,
      offset: data.offset,
      limit: data.limit
    };
  }

  private transformIncident(incident: any): PagerDutyIncident {
    return {
      id: incident.id,
      title: incident.title,
      status: incident.status,
      urgency: incident.urgency,
      createdAt: new Date(incident.created_at),
      resolvedAt: incident.resolved_at ? new Date(incident.resolved_at) : undefined,
      duration: incident.resolved_at ? 
        new Date(incident.resolved_at).getTime() - new Date(incident.created_at).getTime() : 
        Date.now() - new Date(incident.created_at).getTime(),
      service: incident.service?.summary || 'Unknown',
      summary: incident.summary,
      assignees: incident.assignments?.map((assignment: any) => assignment.assignee.summary) || [],
      escalations: incident.escalation_policy?.summary,
      priority: incident.priority?.summary
    };
  }

  private transformTimelineResponse(entries: any[]): IncidentTimelineEntry[] {
    return entries.map(entry => ({
      id: entry.id,
      type: entry.type,
      createdAt: new Date(entry.created_at),
      summary: entry.summary,
      actor: entry.actor?.summary,
      details: entry.channel?.details || {}
    }));
  }
}

interface IncidentsQueryParams {
  timeRange?: TimeRange;
  statuses?: string[];
  urgencies?: string[];
  service?: string;
  limit?: number;
}

interface PagerDutyIncidentsResponse {
  incidents: PagerDutyIncident[];
  total: number;
  offset: number;
  limit: number;
}

interface PagerDutyIncident {
  id: string;
  title: string;
  status: string;
  urgency: string;
  createdAt: Date;
  resolvedAt?: Date;
  duration: number;
  service: string;
  summary: string;
  assignees: string[];
  escalations?: string;
  priority?: string;
}

interface IncidentTimelineEntry {
  id: string;
  type: string;
  createdAt: Date;
  summary: string;
  actor?: string;
  details: Record<string, any>;
}

interface SimilarIncident {
  id: string;
  title: string;
  severity: string;
  status: string;
  createdAt: Date;
  resolvedAt?: Date;
  duration: number;
  service: string;
  summary: string;
}

## ChatOps Integrations

### 1. Slack Integration

#### Configuration

```typescript
// src/integrations/slack/slack.config.ts
export interface SlackConfig {
  botToken: string;
  signingSecret: string;
  appToken: string;
  baseUrl: string;
  timeout: number;
}

export const slackConfig: SlackConfig = {
  botToken: process.env.SLACK_BOT_TOKEN!,
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  appToken: process.env.SLACK_APP_TOKEN!,
  baseUrl: 'https://slack.com/api',
  timeout: 30000
};
```

#### Command Handler

```typescript
// src/integrations/slack/command.handler.ts
export class SlackCommandHandler {
  private config: SlackConfig;
  private httpClient: HttpClient;
  private incidentService: IncidentAnalysisService;

  constructor(config: SlackConfig, incidentService: IncidentAnalysisService) {
    this.config = config;
    this.incidentService = incidentService;
    this.httpClient = new HttpClient({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.botToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async handleCommand(command: SlackCommand): Promise<SlackResponse> {
    try {
      switch (command.command) {
        case '/incident':
          return await this.handleIncidentCommand(command);
        case '/analyze':
          return await this.handleAnalyzeCommand(command);
        case '/summary':
          return await this.handleSummaryCommand(command);
        default:
          return this.createErrorResponse('Unknown command');
      }
    } catch (error) {
      return this.createErrorResponse(`Error: ${error.message}`);
    }
  }

  private async handleIncidentCommand(command: SlackCommand): Promise<SlackResponse> {
    const [action, ...args] = command.text.trim().split(' ');

    switch (action) {
      case 'analyze':
        return await this.handleAnalyzeCommand(command);
      case 'create':
        return await this.handleCreateIncidentCommand(command);
      case 'update':
        return await this.handleUpdateIncidentCommand(command);
      case 'resolve':
        return await this.handleResolveIncidentCommand(command);
      default:
        return this.createHelpResponse();
    }
  }

  private async handleAnalyzeCommand(command: SlackCommand): Promise<SlackResponse> {
    const query = command.text.replace(/^analyze\s*/, '').trim();
    
    if (!query) {
      return this.createErrorResponse('Please provide a service or issue to analyze');
    }

    // Send immediate response
    await this.sendImmediateResponse(command.response_url, {
      response_type: 'in_channel',
      text: `Analyzing: ${query}...`
    });

    try {
      const analysis = await this.incidentService.analyzeIncident({
        query,
        userId: command.user_id,
        source: 'slack',
        channelId: command.channel_id
      });

      return this.formatAnalysisResponse(analysis);
    } catch (error) {
      return this.createErrorResponse(`Analysis failed: ${error.message}`);
    }
  }

  private formatAnalysisResponse(analysis: IncidentAnalysisResponse): SlackResponse {
    return {
      response_type: 'in_channel',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Incident Analysis Complete'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Root Cause:* ${analysis.analysis.rootCause.hypothesis}\n*Confidence:* ${analysis.analysis.rootCause.confidence}%`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Evidence:*'
          }
        },
        ...this.formatEvidenceBlocks(analysis.analysis.rootCause.evidence),
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Immediate Actions:*'
          }
        },
        ...this.formatRecommendationBlocks(analysis.analysis.recommendations),
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Similar Incidents:* Found ${analysis.analysis.similarIncidents.length} similar incidents`
          }
        },
        ...this.formatSimilarIncidentsBlocks(analysis.analysis.similarIncidents)
      ],
      actions: this.createActionButtons(analysis.analysis.recommendations)
    };
  }

  private formatEvidenceBlocks(evidence: EvidenceItem[]): any[] {
    return evidence.slice(0, 5).map(item => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `• ${item.description} (${item.source})`
      }
    }));
  }

  private formatRecommendationBlocks(recommendations: Recommendation[]): any[] {
    return recommendations.slice(0, 3).map(rec => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `• *${rec.title}*: ${rec.description} (Priority: ${rec.priority})`
      }
    }));
  }

  private formatSimilarIncidentsBlocks(similarIncidents: SimilarIncident[]): any[] {
    return similarIncidents.slice(0, 3).map(incident => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `• ${incident.title} (${this.formatTimeAgo(incident.timestamp)}) - ${incident.rootCause}`
      }
    }));
  }

  private createActionButtons(recommendations: Recommendation[]): any[] {
    const actions = recommendations
      .filter(rec => rec.autoExecutable)
      .slice(0, 2)
      .map(rec => ({
        type: 'button',
        text: {
          type: 'plain_text',
          text: `Execute: ${rec.title}`
        },
        value: `execute_${rec.id}`,
        style: rec.priority === 'high' ? 'danger' : 'primary'
      }));

    if (actions.length === 0) {
      return [{
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'View Details'
        },
        url: `${process.env.WEB_BASE_URL}/incidents/${recommendations[0]?.incidentId}`
      }];
    }

    return actions;
  }

  private formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    return 'Recently';
  }

  private async sendImmediateResponse(responseUrl: string, response: any): Promise<void> {
    await this.httpClient.post(responseUrl, response);
  }

  private createErrorResponse(message: string): SlackResponse {
    return {
      response_type: 'ephemeral',
      text: ` ${message}`
    };
  }

  private createHelpResponse(): SlackResponse {
    return {
      response_type: 'ephemeral',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*OpsSage Commands:*\n\n' +
                  '`/incident analyze <service>` - Analyze service issues\n' +
                  '`/incident create <title>` - Create new incident\n' +
                  '`/summary` - Get incident summary\n' +
                  '`/analyze <issue>` - Analyze specific issue'
          }
        }
      ]
    };
  }
}

interface SlackCommand {
  command: string;
  text: string;
  user_id: string;
  channel_id: string;
  response_url: string;
}

interface SlackResponse {
  response_type?: 'in_channel' | 'ephemeral';
  text?: string;
  blocks?: any[];
  actions?: any[];
}

### 2. Microsoft Teams Integration

#### Configuration

```typescript
// src/integrations/teams/teams.config.ts
export interface TeamsConfig {
  botId: string;
  botPassword: string;
  serviceUrl: string;
  tenantId: string;
  timeout: number;
}

export const teamsConfig: TeamsConfig = {
  botId: process.env.TEAMS_BOT_ID!,
  botPassword: process.env.TEAMS_BOT_PASSWORD!,
  serviceUrl: 'https://smba.trafficmanager.net',
  tenantId: process.env.TEAMS_TENANT_ID!,
  timeout: 30000
};
```

#### Adaptive Card Handler

```typescript
// src/integrations/teams/card.handler.ts
export class TeamsCardHandler {
  private config: TeamsConfig;
  private incidentService: IncidentAnalysisService;

  constructor(config: TeamsConfig, incidentService: IncidentAnalysisService) {
    this.config = config;
    this.incidentService = incidentService;
  }

  async createAnalysisCard(analysis: IncidentAnalysisResponse, conversationId: string): Promise<AdaptiveCard> {
    return {
      type: 'AdaptiveCard',
      version: '1.5',
      body: [
        {
          type: 'TextBlock',
          text: 'Incident Analysis Complete',
          size: 'large',
          weight: 'bolder',
          color: this.getSeverityColor(analysis.analysis.rootCause.confidence)
        },
        {
          type: 'TextBlock',
          text: `**Root Cause:** ${analysis.analysis.rootCause.hypothesis}`,
          wrap: true
        },
        {
          type: 'TextBlock',
          text: `**Confidence:** ${analysis.analysis.rootCause.confidence}%`,
          spacing: 'small'
        },
        {
          type: 'FactSet',
          facts: [
            {
              title: 'Service',
              value: analysis.metadata.service || 'Unknown'
            },
            {
              title: 'Duration',
              value: `${analysis.metadata.analysisDuration}s`
            },
            {
              title: 'Data Points',
              value: analysis.metadata.dataPointsAnalyzed.toString()
            }
          ]
        },
        {
          type: 'TextBlock',
          text: 'Evidence',
          weight: 'bolder',
          spacing: 'medium'
        },
        ...this.createEvidenceBlocks(analysis.analysis.rootCause.evidence),
        {
          type: 'TextBlock',
          text: 'Recommendations',
          weight: 'bolder',
          spacing: 'medium'
        },
        ...this.createRecommendationBlocks(analysis.analysis.recommendations),
        {
          type: 'TextBlock',
          text: `Similar Incidents: ${analysis.analysis.similarIncidents.length} found`,
          weight: 'bolder',
          spacing: 'medium'
        },
        ...this.createSimilarIncidentBlocks(analysis.analysis.similarIncidents)
      ],
      actions: this.createActionButtons(analysis.analysis.recommendations)
    };
  }

  private createEvidenceBlocks(evidence: EvidenceItem[]): any[] {
    return evidence.slice(0, 3).map(item => ({
      type: 'TextBlock',
      text: `• ${item.description}`,
      wrap: true,
      spacing: 'small'
    }));
  }

  private createRecommendationBlocks(recommendations: Recommendation[]): any[] {
    return recommendations.slice(0, 3).map(rec => ({
      type: 'TextBlock',
      text: `• **${rec.title}**: ${rec.description}`,
      wrap: true,
      spacing: 'small'
    }));
  }

  private createSimilarIncidentBlocks(similarIncidents: SimilarIncident[]): any[] {
    return similarIncidents.slice(0, 2).map(incident => ({
      type: 'TextBlock',
      text: `• ${incident.title} (${this.formatTimeAgo(incident.timestamp)})`,
      wrap: true,
      spacing: 'small'
    }));
  }

  private createActionButtons(recommendations: Recommendation[]): any[] {
    const actions = recommendations
      .filter(rec => rec.autoExecutable)
      .slice(0, 2)
      .map(rec => ({
        type: 'Action.Submit',
        title: `Execute: ${rec.title}`,
        data: {
          action: 'execute',
          recommendationId: rec.id,
          type: 'recommendation'
        }
      }));

    if (actions.length === 0) {
      return [{
        type: 'Action.OpenUrl',
        title: 'View Details',
        url: `${process.env.WEB_BASE_URL}/incidents/${recommendations[0]?.incidentId}`
      }];
    }

    return actions;
  }

  private getSeverityColor(confidence: number): string {
    if (confidence >= 80) return 'attention';
    if (confidence >= 60) return 'warning';
    return 'good';
  }

  private formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    return 'Recently';
  }
}

interface AdaptiveCard {
  type: string;
  version: string;
  body: any[];
  actions?: any[];
}
```

##  Usage Examples

### Complete Integration Example

```typescript
// src/examples/complete-integration.example.ts
import { DatadogLogsCollector } from '../integrations/datadog/logs.collector';
import { KubernetesPodsCollector } from '../integrations/kubernetes/pods.collector';
import { PagerDutyIncidentsCollector } from '../integrations/pagerduty/incidents.collector';
import { SlackCommandHandler } from '../integrations/slack/command.handler';

export class IntegrationExample {
  private datadogLogs: DatadogLogsCollector;
  private k8sPods: KubernetesPodsCollector;
  private pagerDuty: PagerDutyIncidentsCollector;
  private slackHandler: SlackCommandHandler;

  constructor() {
    this.datadogLogs = new DatadogLogsCollector(datadogConfig);
    this.k8sPods = new KubernetesPodsCollector(kubernetesConfig);
    this.pagerDuty = new PagerDutyIncidentsCollector(pagerDutyConfig);
    this.slackHandler = new SlackCommandHandler(slackConfig, incidentService);
  }

  async analyzeServiceIncident(service: string): Promise<IncidentAnalysisResponse> {
    const timeRange = {
      start: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      end: new Date()
    };

    try {
      // Collect data from all sources in parallel
      const [logs, podHealth, recentIncidents] = await Promise.all([
        this.datadogLogs.getErrorPatterns(service, timeRange),
        this.k8sPods.getPodHealth(service),
        this.pagerDuty.getSimilarIncidents(service, timeRange)
      ]);

      // Analyze collected data
      const analysis = await this.analyzeCollectedData({
        service,
        timeRange,
        logs,
        podHealth,
        recentIncidents
      });

      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze incident: ${error.message}`);
    }
  }

  async handleSlackCommand(command: SlackCommand): Promise<SlackResponse> {
    return await this.slackHandler.handleCommand(command);
  }

  private async analyzeCollectedData(data: CollectedIncidentData): Promise<IncidentAnalysisResponse> {
    // Implementation would integrate with AI pipeline
    // This is a simplified example
    return {
      incidentId: `inc_${Date.now()}`,
      query: `Analyze ${data.service}`,
      analysis: {
        rootCause: {
          hypothesis: this.generateHypothesis(data),
          confidence: this.calculateConfidence(data),
          evidence: this.extractEvidence(data)
        },
        recommendations: this.generateRecommendations(data),
        similarIncidents: data.recentIncidents
      },
      metadata: {
        analysisDuration: 25.5,
        dataPointsAnalyzed: data.logs.length + data.podHealth.totalPods,
        modelVersion: 'gpt-4-1106'
      }
    };
  }

  private generateHypothesis(data: CollectedIncidentData): string {
    if (data.podHealth.failedPods > 0) {
      return `Pod failures detected in ${data.service}`;
    }
    if (data.logs.some(log => log.frequency > 0.1)) {
      return `High error rate detected in ${data.service}`;
    }
    return `Performance degradation in ${data.service}`;
  }

  private calculateConfidence(data: CollectedIncidentData): number {
    let confidence = 50;
    
    if (data.podHealth.failedPods > 0) confidence += 20;
    if (data.logs.some(log => log.frequency > 0.1)) confidence += 15;
    if (data.recentIncidents.length > 0) confidence += 10;
    
    return Math.min(confidence, 95);
  }

  private extractEvidence(data: CollectedIncidentData): EvidenceItem[] {
    const evidence: EvidenceItem[] = [];

    data.logs.forEach(log => {
      evidence.push({
        type: 'log_pattern',
        description: log.pattern,
        source: 'datadog',
        confidence: Math.round(log.frequency * 100),
        data: {
          pattern: log.pattern,
          count: log.count,
          samples: log.samples
        }
      });
    });

    if (data.podHealth.failedPods > 0) {
      evidence.push({
        type: 'infrastructure',
        description: `${data.podHealth.failedPods} pods in failed state`,
        source: 'kubernetes',
        confidence: 90,
        data: {
          failedPods: data.podHealth.failedPods,
          totalPods: data.podHealth.totalPods
        }
      });
    }

    return evidence;
  }

  private generateRecommendations(data: CollectedIncidentData): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (data.podHealth.failedPods > 0) {
      recommendations.push({
        id: `rec_${Date.now()}_1`,
        type: 'immediate_action',
        title: 'Restart Failed Pods',
        description: 'Restart pods that are in failed state',
        priority: 'high',
        autoExecutable: true,
        command: `kubectl rollout restart deployment/${data.service}`,
        confidence: 85,
        reasoning: 'Pod restart often resolves transient issues'
      });
    }

    if (data.logs.some(log => log.frequency > 0.1)) {
      recommendations.push({
        id: `rec_${Date.now()}_2`,
        type: 'investigation',
        title: 'Investigate Error Patterns',
        description: 'Analyze error logs to identify root cause',
        priority: 'medium',
        autoExecutable: false,
        confidence: 70,
        reasoning: 'Error patterns indicate underlying issues'
      });
    }

    return recommendations;
  }
}

// Usage example
const example = new IntegrationExample();

// Handle Slack command
const slackCommand: SlackCommand = {
  command: '/incident',
  text: 'analyze checkout-service',
  user_id: 'U123456',
  channel_id: 'C789012',
  response_url: 'https://hooks.slack.com/...'
};

const slackResponse = await example.handleSlackCommand(slackCommand);

// Analyze service incident
const analysis = await example.analyzeServiceIncident('checkout-service');
console.log('Analysis result:', analysis);
```

This comprehensive integration guide provides complete examples for connecting OpsSage with major monitoring and communication platforms, enabling full-stack incident management capabilities.
