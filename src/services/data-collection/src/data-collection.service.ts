import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatadogCollector } from './collectors/datadog.collector';
import { KubernetesCollector } from './collectors/kubernetes.collector';
import { PagerDutyCollector } from './collectors/pagerduty.collector';

export interface CollectionResult {
  source: string;
  type: 'logs' | 'metrics' | 'events' | 'incidents';
  data: any[];
  timestamp: Date;
  metadata?: any;
}

export interface CollectionMetrics {
  totalCollected: number;
  bySource: Record<string, number>;
  byType: Record<string, number>;
  errors: string[];
  duration: number;
}

@Injectable()
export class DataCollectionService {
  private readonly logger = new Logger(DataCollectionService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly datadogCollector: DatadogCollector,
    private readonly kubernetesCollector: KubernetesCollector,
    private readonly pagerDutyCollector: PagerDutyCollector,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async collectMetrics(): Promise<void> {
    this.logger.log('Starting scheduled data collection...');
    
    const startTime = Date.now();
    const results: CollectionResult[] = [];
    const errors: string[] = [];

    try {
      // Collect from Datadog
      if (this.configService.get('DATADOG_ENABLED', true)) {
        try {
          const datadogResults = await this.collectFromDatadog();
          results.push(...datadogResults);
        } catch (error) {
          errors.push(`Datadog collection failed: ${error.message}`);
        }
      }

      // Collect from Kubernetes
      if (this.configService.get('KUBERNETES_ENABLED', true)) {
        try {
          const k8sResults = await this.collectFromKubernetes();
          results.push(...k8sResults);
        } catch (error) {
          errors.push(`Kubernetes collection failed: ${error.message}`);
        }
      }

      // Collect from PagerDuty
      if (this.configService.get('PAGERDUTY_ENABLED', true)) {
        try {
          const pdResults = await this.collectFromPagerDuty();
          results.push(...pdResults);
        } catch (error) {
          errors.push(`PagerDuty collection failed: ${error.message}`);
        }
      }

      // Process and store collected data
      await this.processCollectionResults(results);

      const duration = Date.now() - startTime;
      const metrics = this.calculateMetrics(results, errors, duration);
      
      this.logger.log(`Data collection completed in ${duration}ms. Collected ${metrics.totalCollected} items`);
      
    } catch (error) {
      this.logger.error('Data collection failed', error);
    }
  }

  async collectOnDemand(sources: string[], timeRange: { start: Date; end: Date }): Promise<CollectionResult[]> {
    this.logger.log(`Starting on-demand collection from sources: ${sources.join(', ')}`);
    
    const results: CollectionResult[] = [];
    
    for (const source of sources) {
      switch (source) {
        case 'datadog':
          try {
            const datadogResults = await this.datadogCollector.collect(timeRange);
            results.push(...datadogResults);
          } catch (error) {
            this.logger.error(`Datadog on-demand collection failed`, error);
          }
          break;
          
        case 'kubernetes':
          try {
            const k8sResults = await this.kubernetesCollector.collect(timeRange);
            results.push(...k8sResults);
          } catch (error) {
            this.logger.error(`Kubernetes on-demand collection failed`, error);
          }
          break;
          
        case 'pagerduty':
          try {
            const pdResults = await this.pagerDutyCollector.collect(timeRange);
            results.push(...pdResults);
          } catch (error) {
            this.logger.error(`PagerDuty on-demand collection failed`, error);
          }
          break;
          
        default:
          this.logger.warn(`Unknown data source: ${source}`);
      }
    }
    
    return results;
  }

  private async collectFromDatadog(): Promise<CollectionResult[]> {
    const timeRange = {
      start: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      end: new Date(),
    };
    
    return this.datadogCollector.collect(timeRange);
  }

  private async collectFromKubernetes(): Promise<CollectionResult[]> {
    const timeRange = {
      start: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      end: new Date(),
    };
    
    return this.kubernetesCollector.collect(timeRange);
  }

  private async collectFromPagerDuty(): Promise<CollectionResult[]> {
    const timeRange = {
      start: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      end: new Date(),
    };
    
    return this.pagerDutyCollector.collect(timeRange);
  }

  private async processCollectionResults(results: CollectionResult[]): Promise<void> {
    // Process collected data and send to AI Engine
    for (const result of results) {
      try {
        // Send to message queue for processing by AI Engine
        await this.sendToProcessingQueue(result);
      } catch (error) {
        this.logger.error(`Failed to process result from ${result.source}`, error);
      }
    }
  }

  private async sendToProcessingQueue(result: CollectionResult): Promise<void> {
    // Implementation for sending to message queue
    // This would typically use RabbitMQ, Kafka, or similar
    this.logger.debug(`Sending ${result.data.length} items from ${result.source} to processing queue`);
  }

  private calculateMetrics(results: CollectionResult[], errors: string[], duration: number): CollectionMetrics {
    const bySource: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalCollected = 0;

    for (const result of results) {
      totalCollected += result.data.length;
      bySource[result.source] = (bySource[result.source] || 0) + result.data.length;
      byType[result.type] = (byType[result.type] || 0) + result.data.length;
    }

    return {
      totalCollected,
      bySource,
      byType,
      errors,
      duration,
    };
  }

  async getCollectionStatus(): Promise<any> {
    return {
      status: 'active',
      lastCollection: new Date(),
      enabledSources: {
        datadog: this.configService.get('DATADOG_ENABLED', true),
        kubernetes: this.configService.get('KUBERNETES_ENABLED', true),
        pagerduty: this.configService.get('PAGERDUTY_ENABLED', true),
      },
      collectionInterval: '1 minute',
    };
  }
}
