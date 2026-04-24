import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as k8s from '@kubernetes/client-node';
import { CollectionResult } from '../data-collection.service';

@Injectable()
export class KubernetesCollector {
  private readonly logger = new Logger(KubernetesCollector.name);
  private readonly k8sApi: k8s.CoreV1Api;
  private readonly appsApi: k8s.AppsV1Api;
  private readonly networkingApi: k8s.NetworkingV1Api;

  constructor(private readonly configService: ConfigService) {
    const kc = new k8s.KubeConfig();
    
    // Load kubeconfig from file or in-cluster config
    try {
      const kubeConfigPath = this.configService.get<string>('KUBERNETES_CONFIG');
      if (kubeConfigPath) {
        kc.loadFromFile(kubeConfigPath);
      } else {
        kc.loadFromDefault();
      }
    } catch (error) {
      this.logger.warn('Failed to load Kubernetes config, using in-cluster config');
      kc.loadFromCluster();
    }

    this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    this.appsApi = kc.makeApiClient(k8s.AppsV1Api);
    this.networkingApi = kc.makeApiClient(k8s.NetworkingV1Api);
  }

  async collect(timeRange: { start: Date; end: Date }): Promise<CollectionResult[]> {
    const results: CollectionResult[] = [];

    try {
      // Collect events
      const events = await this.collectEvents(timeRange);
      if (events.length > 0) {
        results.push({
          source: 'kubernetes',
          type: 'events',
          data: events,
          timestamp: new Date(),
          metadata: { timeRange, sourceType: 'kubernetes-events' },
        });
      }

      // Collect pod status
      const pods = await this.collectPodStatus();
      if (pods.length > 0) {
        results.push({
          source: 'kubernetes',
          type: 'metrics',
          data: pods,
          timestamp: new Date(),
          metadata: { timeRange, sourceType: 'kubernetes-pods' },
        });
      }

      // Collect deployment status
      const deployments = await this.collectDeploymentStatus();
      if (deployments.length > 0) {
        results.push({
          source: 'kubernetes',
          type: 'events',
          data: deployments,
          timestamp: new Date(),
          metadata: { timeRange, sourceType: 'kubernetes-deployments' },
        });
      }

      // Collect service status
      const services = await this.collectServiceStatus();
      if (services.length > 0) {
        results.push({
          source: 'kubernetes',
          type: 'metrics',
          data: services,
          timestamp: new Date(),
          metadata: { timeRange, sourceType: 'kubernetes-services' },
        });
      }

    } catch (error) {
      this.logger.error('Kubernetes collection failed', error);
      throw error;
    }

    return results;
  }

  private async collectEvents(timeRange: { start: Date; end: Date }): Promise<any[]> {
    try {
      const namespace = this.configService.get<string>('KUBERNETES_NAMESPACE', 'default');
      const response = await this.k8sApi.listNamespacedEvent(
        namespace,
        undefined,
        undefined,
        undefined,
        timeRange.end.toISOString(),
        timeRange.start.toISOString(),
      );

      return response.body.items.map(event => ({
        type: event.type,
        reason: event.reason,
        message: event.message,
        involvedObject: {
          kind: event.involvedObject?.kind,
          name: event.involvedObject?.name,
          namespace: event.involvedObject?.namespace,
        },
        timestamp: event.lastTimestamp || event.eventTime,
        source: event.source?.component,
        metadata: {
          uid: event.metadata?.uid,
          namespace: event.metadata?.namespace,
          name: event.metadata?.name,
        },
      }));
    } catch (error) {
      this.logger.error('Failed to collect Kubernetes events', error);
      return [];
    }
  }

  private async collectPodStatus(): Promise<any[]> {
    try {
      const namespace = this.configService.get<string>('KUBERNETES_NAMESPACE', 'default');
      const response = await this.k8sApi.listNamespacedPod(namespace);

      return response.body.items.map(pod => ({
        name: pod.metadata?.name,
        namespace: pod.metadata?.namespace,
        status: pod.status?.phase,
        phase: pod.status?.phase,
        podIP: pod.status?.podIP,
        hostIP: pod.status?.hostIP,
        startTime: pod.status?.startTime,
        containers: pod.spec?.containers?.map(container => ({
          name: container.name,
          image: container.image,
          ready: false, // Would need to check container status
          restartCount: 0, // Would need to check container status
        })),
        conditions: pod.status?.conditions?.map(condition => ({
          type: condition.type,
          status: condition.status,
          reason: condition.reason,
          message: condition.message,
        })),
        labels: pod.metadata?.labels,
        annotations: pod.metadata?.annotations,
        timestamp: new Date(),
      }));
    } catch (error) {
      this.logger.error('Failed to collect pod status', error);
      return [];
    }
  }

  private async collectDeploymentStatus(): Promise<any[]> {
    try {
      const namespace = this.configService.get<string>('KUBERNETES_NAMESPACE', 'default');
      const response = await this.appsApi.listNamespacedDeployment(namespace);

      return response.body.items.map(deployment => ({
        name: deployment.metadata?.name,
        namespace: deployment.metadata?.namespace,
        replicas: deployment.spec?.replicas,
        readyReplicas: deployment.status?.readyReplicas || 0,
        availableReplicas: deployment.status?.availableReplicas || 0,
        unavailableReplicas: deployment.status?.unavailableReplicas || 0,
        updatedReplicas: deployment.status?.updatedReplicas || 0,
        conditions: deployment.status?.conditions?.map(condition => ({
          type: condition.type,
          status: condition.status,
          reason: condition.reason,
          message: condition.message,
          lastUpdateTime: condition.lastUpdateTime,
        })),
        labels: deployment.metadata?.labels,
        annotations: deployment.metadata?.annotations,
        timestamp: new Date(),
      }));
    } catch (error) {
      this.logger.error('Failed to collect deployment status', error);
      return [];
    }
  }

  private async collectServiceStatus(): Promise<any[]> {
    try {
      const namespace = this.configService.get<string>('KUBERNETES_NAMESPACE', 'default');
      const response = await this.k8sApi.listNamespacedService(namespace);

      return response.body.items.map(service => ({
        name: service.metadata?.name,
        namespace: service.metadata?.namespace,
        clusterIP: service.spec?.clusterIP,
        externalIPs: service.spec?.externalIPs,
        ports: service.spec?.ports?.map(port => ({
          name: port.name,
          port: port.port,
          targetPort: port.targetPort,
          protocol: port.protocol,
        })),
        selector: service.spec?.selector,
        type: service.spec?.type,
        labels: service.metadata?.labels,
        annotations: service.metadata?.annotations,
        timestamp: new Date(),
      }));
    } catch (error) {
      this.logger.error('Failed to collect service status', error);
      return [];
    }
  }

  async getPodLogs(podName: string, namespace?: string, timeRange?: { start: Date; end: Date }): Promise<string> {
    try {
      const targetNamespace = namespace || this.configService.get<string>('KUBERNETES_NAMESPACE', 'default');
      
      const response = await this.k8sApi.readNamespacedPodLog(
        podName,
        targetNamespace,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        timeRange?.end.toISOString(),
        timeRange?.start.toISOString(),
      );

      return response.body;
    } catch (error) {
      this.logger.error(`Failed to get logs for pod ${podName}`, error);
      return '';
    }
  }

  async getPodMetrics(podName: string, namespace?: string): Promise<any> {
    try {
      const targetNamespace = namespace || this.configService.get<string>('KUBERNETES_NAMESPACE', 'default');
      const pod = await this.k8sApi.readNamespacedPod(podName, targetNamespace);

      const podData = pod.body;
      return {
        name: podData.metadata?.name,
        namespace: podData.metadata?.namespace,
        status: podData.status?.phase,
        containers: podData.status?.containerStatuses?.map(status => ({
          name: status.name,
          ready: status.ready,
          restartCount: status.restartCount,
          image: status.image,
          imageID: status.imageID,
          state: status.state,
        })),
        startTime: podData.status?.startTime,
        podIP: podData.status?.podIP,
        hostIP: podData.status?.hostIP,
        qosClass: podData.status?.qosClass,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to get metrics for pod ${podName}`, error);
      return null;
    }
  }

  async getNamespaceEvents(namespace: string, timeRange?: { start: Date; end: Date }): Promise<any[]> {
    try {
      const response = await this.k8sApi.listNamespacedEvent(
        namespace,
        undefined,
        undefined,
        undefined,
        timeRange?.end.toISOString(),
        timeRange?.start.toISOString(),
      );

      return response.body.items.map(event => ({
        type: event.type,
        reason: event.reason,
        message: event.message,
        involvedObject: {
          kind: event.involvedObject?.kind,
          name: event.involvedObject?.name,
          namespace: event.involvedObject?.namespace,
        },
        timestamp: event.lastTimestamp || event.eventTime,
        source: event.source?.component,
        metadata: {
          uid: event.metadata?.uid,
          namespace: event.metadata?.namespace,
          name: event.metadata?.name,
        },
      }));
    } catch (error) {
      this.logger.error(`Failed to get events for namespace ${namespace}`, error);
      return [];
    }
  }
}
