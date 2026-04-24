import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CollectionResult } from '../data-collection.service';

@Injectable()
export class PagerDutyCollector {
  private readonly logger = new Logger(PagerDutyCollector.name);
  private readonly baseUrl = 'https://api.pagerduty.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async collect(timeRange: { start: Date; end: Date }): Promise<CollectionResult[]> {
    const results: CollectionResult[] = [];
    const apiKey = this.configService.get<string>('PAGERDUTY_API_KEY');

    if (!apiKey) {
      throw new Error('PagerDuty API key not configured');
    }

    try {
      // Collect incidents
      const incidents = await this.collectIncidents(timeRange, apiKey);
      if (incidents.length > 0) {
        results.push({
          source: 'pagerduty',
          type: 'incidents',
          data: incidents,
          timestamp: new Date(),
          metadata: { timeRange, sourceType: 'pagerduty-incidents' },
        });
      }

      // Collect alerts
      const alerts = await this.collectAlerts(timeRange, apiKey);
      if (alerts.length > 0) {
        results.push({
          source: 'pagerduty',
          type: 'events',
          data: alerts,
          timestamp: new Date(),
          metadata: { timeRange, sourceType: 'pagerduty-alerts' },
        });
      }

    } catch (error) {
      this.logger.error('PagerDuty collection failed', error);
      throw error;
    }

    return results;
  }

  private async collectIncidents(
    timeRange: { start: Date; end: Date },
    apiKey: string,
  ): Promise<any[]> {
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.baseUrl}/incidents`,
        {
          params: {
            since: timeRange.start.toISOString(),
            until: timeRange.end.toISOString(),
            limit: 100,
            sort_by: 'created_at:desc',
            statuses: 'triggered,acknowledged,resolved',
          },
          headers: {
            'Authorization': `Token token=${apiKey}`,
            'Accept': 'application/vnd.pagerduty+json;version=2',
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.incidents?.map(incident => ({
        id: incident.id,
        type: incident.type,
        title: incident.title,
        status: incident.status,
        urgency: incident.urgency,
        priority: incident.priority?.summary || null,
        service: {
          id: incident.service?.id,
          name: incident.service?.summary,
          type: incident.service?.type,
        },
        assignment: incident.assignments?.map(assignment => ({
          assignee: assignment.assignee?.summary,
          type: assignment.assignee?.type,
        })),
        created_at: incident.created_at,
        updated_at: incident.updated_at,
        acknowledged_at: incident.acknowledged_at,
        resolved_at: incident.resolved_at,
        incident_key: incident.incident_key,
        body: incident.body?.details || null,
        summary: incident.summary,
        metadata: {
          number: incident.incident_number,
          url: incident.html_url,
        },
      })) || [];
    } catch (error) {
      this.logger.error('Failed to collect incidents from PagerDuty', error);
      return [];
    }
  }

  private async collectAlerts(
    timeRange: { start: Date; end: Date },
    apiKey: string,
  ): Promise<any[]> {
    try {
      // First get incidents, then get their alerts
      const incidentsResponse = await this.httpService.axiosRef.get(
        `${this.baseUrl}/incidents`,
        {
          params: {
            since: timeRange.start.toISOString(),
            until: timeRange.end.toISOString(),
            limit: 100,
            statuses: 'triggered,acknowledged,resolved',
          },
          headers: {
            'Authorization': `Token token=${apiKey}`,
            'Accept': 'application/vnd.pagerduty+json;version=2',
            'Content-Type': 'application/json',
          },
        },
      );

      const alerts = [];
      const incidents = incidentsResponse.data.incidents || [];

      for (const incident of incidents) {
        try {
          const alertsResponse = await this.httpService.axiosRef.get(
            `${this.baseUrl}/incidents/${incident.id}/alerts`,
            {
              headers: {
                'Authorization': `Token token=${apiKey}`,
                'Accept': 'application/vnd.pagerduty+json;version=2',
                'Content-Type': 'application/json',
              },
            },
          );

          const incidentAlerts = alertsResponse.data.alerts?.map(alert => ({
            id: alert.id,
            type: alert.type,
            status: alert.status,
            summary: alert.summary,
            body: alert.body?.details || null,
            created_at: alert.created_at,
            acknowledged_at: alert.acknowledged_at,
            resolved_at: alert.resolved_at,
            incident_id: incident.id,
            service: {
              id: incident.service?.id,
              name: incident.service?.summary,
            },
            metadata: {
              severity: alert.severity,
              source: alert.source,
              group: alert.group,
              class: alert.class,
            },
          })) || [];

          alerts.push(...incidentAlerts);
        } catch (error) {
          this.logger.error(`Failed to get alerts for incident ${incident.id}`, error);
        }
      }

      return alerts;
    } catch (error) {
      this.logger.error('Failed to collect alerts from PagerDuty', error);
      return [];
    }
  }

  async getIncidentTimeline(incidentId: string): Promise<any[]> {
    const apiKey = this.configService.get<string>('PAGERDUTY_API_KEY');

    try {
      // Get incident details
      const incidentResponse = await this.httpService.axiosRef.get(
        `${this.baseUrl}/incidents/${incidentId}`,
        {
          headers: {
            'Authorization': `Token token=${apiKey}`,
            'Accept': 'application/vnd.pagerduty+json;version=2',
            'Content-Type': 'application/json',
          },
        },
      );

      const incident = incidentResponse.data.incident;

      // Get incident alerts
      const alertsResponse = await this.httpService.axiosRef.get(
        `${this.baseUrl}/incidents/${incidentId}/alerts`,
        {
          headers: {
            'Authorization': `Token token=${apiKey}`,
            'Accept': 'application/vnd.pagerduty+json;version=2',
            'Content-Type': 'application/json',
          },
        },
      );

      const alerts = alertsResponse.data.alerts || [];

      // Build timeline
      const timeline = [];

      // Add incident creation
      timeline.push({
        timestamp: incident.created_at,
        type: 'incident_created',
        title: 'Incident Created',
        description: incident.title,
        severity: incident.urgency,
        data: {
          status: incident.status,
          service: incident.service?.summary,
          assignee: incident.assignments?.[0]?.assignee?.summary,
        },
      });

      // Add alerts
      for (const alert of alerts) {
        timeline.push({
          timestamp: alert.created_at,
          type: 'alert_triggered',
          title: 'Alert Triggered',
          description: alert.summary,
          severity: alert.severity,
          data: {
            alert_id: alert.id,
            source: alert.source,
            group: alert.group,
          },
        });
      }

      // Add acknowledgments
      if (incident.acknowledged_at) {
        timeline.push({
          timestamp: incident.acknowledged_at,
          type: 'incident_acknowledged',
          title: 'Incident Acknowledged',
          description: 'Incident was acknowledged',
          data: {
            assignee: incident.assignments?.[0]?.assignee?.summary,
          },
        });
      }

      // Add resolution
      if (incident.resolved_at) {
        timeline.push({
          timestamp: incident.resolved_at,
          type: 'incident_resolved',
          title: 'Incident Resolved',
          description: 'Incident was resolved',
          data: {
            resolution: incident.resolution_details || null,
          },
        });
      }

      // Sort timeline by timestamp
      timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return timeline;
    } catch (error) {
      this.logger.error(`Failed to get timeline for incident ${incidentId}`, error);
      return [];
    }
  }

  async getServiceIncidents(serviceId: string, timeRange?: { start: Date; end: Date }): Promise<any[]> {
    const apiKey = this.configService.get<string>('PAGERDUTY_API_KEY');

    try {
      const params: any = {
        service_ids: [serviceId],
        limit: 100,
        sort_by: 'created_at:desc',
        statuses: 'triggered,acknowledged,resolved',
      };

      if (timeRange) {
        params.since = timeRange.start.toISOString();
        params.until = timeRange.end.toISOString();
      }

      const response = await this.httpService.axiosRef.get(
        `${this.baseUrl}/incidents`,
        {
          params,
          headers: {
            'Authorization': `Token token=${apiKey}`,
            'Accept': 'application/vnd.pagerduty+json;version=2',
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.incidents || [];
    } catch (error) {
      this.logger.error(`Failed to get incidents for service ${serviceId}`, error);
      return [];
    }
  }

  async createIncident(incidentData: {
    title: string;
    service: string;
    urgency: 'high' | 'low';
    details?: any;
  }): Promise<any> {
    const apiKey = this.configService.get<string>('PAGERDUTY_API_KEY');

    try {
      const response = await this.httpService.axiosRef.post(
        `${this.baseUrl}/incidents`,
        {
          incident: {
            type: 'incident',
            title: incidentData.title,
            service: {
              type: 'service_reference',
              id: incidentData.service,
            },
            urgency: incidentData.urgency,
            body: {
              type: 'incident_body',
              details: incidentData.details || {},
            },
          },
        },
        {
          headers: {
            'Authorization': `Token token=${apiKey}`,
            'Accept': 'application/vnd.pagerduty+json;version=2',
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.incident;
    } catch (error) {
      this.logger.error('Failed to create incident in PagerDuty', error);
      throw error;
    }
  }
}
