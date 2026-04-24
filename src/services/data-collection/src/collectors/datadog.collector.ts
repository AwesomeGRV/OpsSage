import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CollectionResult } from '../data-collection.service';

@Injectable()
export class DatadogCollector {
  private readonly logger = new Logger(DatadogCollector.name);
  private readonly baseUrl = 'https://api.datadoghq.com/api/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async collect(timeRange: { start: Date; end: Date }): Promise<CollectionResult[]> {
    const results: CollectionResult[] = [];
    const apiKey = this.configService.get<string>('DATADOG_API_KEY');
    const appKey = this.configService.get<string>('DATADOG_APP_KEY');

    if (!apiKey || !appKey) {
      throw new Error('Datadog API keys not configured');
    }

    try {
      // Collect logs
      const logs = await this.collectLogs(timeRange, apiKey, appKey);
      if (logs.length > 0) {
        results.push({
          source: 'datadog',
          type: 'logs',
          data: logs,
          timestamp: new Date(),
          metadata: { timeRange, sourceType: 'datadog-logs' },
        });
      }

      // Collect metrics
      const metrics = await this.collectMetrics(timeRange, apiKey, appKey);
      if (metrics.length > 0) {
        results.push({
          source: 'datadog',
          type: 'metrics',
          data: metrics,
          timestamp: new Date(),
          metadata: { timeRange, sourceType: 'datadog-metrics' },
        });
      }

      // Collect traces (if enabled)
      if (this.configService.get('DATADOG_TRACES_ENABLED', false)) {
        const traces = await this.collectTraces(timeRange, apiKey, appKey);
        if (traces.length > 0) {
          results.push({
            source: 'datadog',
            type: 'traces',
            data: traces,
            timestamp: new Date(),
            metadata: { timeRange, sourceType: 'datadog-traces' },
          });
        }
      }

    } catch (error) {
      this.logger.error('Datadog collection failed', error);
      throw error;
    }

    return results;
  }

  private async collectLogs(
    timeRange: { start: Date; end: Date },
    apiKey: string,
    appKey: string,
  ): Promise<any[]> {
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.baseUrl}/logs-queries/search`,
        {
          query: this.buildLogQuery(),
          time: {
            from: timeRange.start.toISOString(),
            to: timeRange.end.toISOString(),
          },
          limit: 1000,
        },
        {
          headers: {
            'DD-API-KEY': apiKey,
            'DD-APPLICATION-KEY': appKey,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.data?.logs || [];
    } catch (error) {
      this.logger.error('Failed to collect logs from Datadog', error);
      return [];
    }
  }

  private async collectMetrics(
    timeRange: { start: Date; end: Date },
    apiKey: string,
    appKey: string,
  ): Promise<any[]> {
    try {
      const metrics = [];
      const metricQueries = this.buildMetricQueries();

      for (const query of metricQueries) {
        const response = await this.httpService.axiosRef.get(
          `${this.baseUrl}/query`,
          {
            params: {
              query: query.query,
              from: timeRange.start.getTime() / 1000,
              to: timeRange.end.getTime() / 1000,
            },
            headers: {
              'DD-API-KEY': apiKey,
              'DD-APPLICATION-KEY': appKey,
            },
          },
        );

        if (response.data.series) {
          metrics.push({
            metric: query.name,
            data: response.data.series,
            timestamp: new Date(),
          });
        }
      }

      return metrics;
    } catch (error) {
      this.logger.error('Failed to collect metrics from Datadog', error);
      return [];
    }
  }

  private async collectTraces(
    timeRange: { start: Date; end: Date },
    apiKey: string,
    appKey: string,
  ): Promise<any[]> {
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.baseUrl}/trace/search`,
        {
          params: {
            start: timeRange.start.getTime() * 1000000, // Datadog uses nanoseconds
            end: timeRange.end.getTime() * 1000000,
            limit: 100,
          },
          headers: {
            'DD-API-KEY': apiKey,
            'DD-APPLICATION-KEY': appKey,
          },
        },
      );

      return response.data.data?.traces || [];
    } catch (error) {
      this.logger.error('Failed to collect traces from Datadog', error);
      return [];
    }
  }

  private buildLogQuery(): string {
    // Build query for error logs and performance issues
    const serviceQueries = this.configService.get<string[]>('DATADOG_SERVICES', []);
    const baseQuery = 'status:(error OR warning OR critical)';
    
    if (serviceQueries.length > 0) {
      const serviceFilter = serviceQueries.map(service => `service:${service}`).join(' OR ');
      return `(${baseQuery}) AND (${serviceFilter})`;
    }
    
    return baseQuery;
  }

  private buildMetricQueries(): Array<{ name: string; query: string }> {
    return [
      {
        name: 'error_rate',
        query: 'avg:trace.servlet.request.errors{env:production}.by("service")',
      },
      {
        name: 'response_time',
        query: 'avg:trace.servlet.request.duration{env:production}.by("service")',
      },
      {
        name: 'throughput',
        query: 'sum:trace.servlet.request.hits{env:production}.by("service")',
      },
      {
        name: 'cpu_usage',
        query: 'avg:system.cpu.total{env:production}.by("host")',
      },
      {
        name: 'memory_usage',
        query: 'avg:system.mem.used{env:production}.by("host")',
      },
      {
        name: 'database_connections',
        query: 'avg:postgresql.connections{env:production}.by("service")',
      },
    ];
  }

  async getIncidentLogs(incidentId: string, timeRange: { start: Date; end: Date }): Promise<any[]> {
    const apiKey = this.configService.get<string>('DATADOG_API_KEY');
    const appKey = this.configService.get<string>('DATADOG_APP_KEY');

    try {
      const response = await this.httpService.axiosRef.post(
        `${this.baseUrl}/logs-queries/search`,
        {
          query: `@incident.id:${incidentId}`,
          time: {
            from: timeRange.start.toISOString(),
            to: timeRange.end.toISOString(),
          },
          limit: 1000,
        },
        {
          headers: {
            'DD-API-KEY': apiKey,
            'DD-APPLICATION-KEY': appKey,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.data?.logs || [];
    } catch (error) {
      this.logger.error(`Failed to get incident logs for ${incidentId}`, error);
      return [];
    }
  }
}
