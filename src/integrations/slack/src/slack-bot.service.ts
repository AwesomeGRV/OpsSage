import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { App, SlackCommandMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { v4 as uuidv4 } from 'uuid';

export interface SlackCommandResponse {
  response_type: 'in_channel' | 'ephemeral';
  text?: string;
  blocks?: any[];
  attachments?: any[];
}

export interface IncidentAnalysis {
  id: string;
  query: string;
  analysis: {
    rootCause: {
      hypothesis: string;
      confidence: number;
      evidence: Array<{
        type: string;
        description: string;
        source: string;
        confidence: number;
      }>;
    };
    similarIncidents: Array<{
      id: string;
      title: string;
      similarity: number;
      explanation: string;
    }>;
    recommendations: Array<{
      title: string;
      description: string;
      priority: string;
      autoExecutable: boolean;
      command?: string;
    }>;
    timeline: Array<{
      timestamp: string;
      type: string;
      title: string;
      description: string;
    }>;
  };
  metadata: {
    analysisDuration: number;
    confidence: number;
    sources: string[];
  };
}

@Injectable()
export class SlackBotService {
  private readonly logger = new Logger(SlackBotService.name);
  private app: App;
  private webClient: WebClient;
  private apiGatewayUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.initializeSlackApp();
    this.apiGatewayUrl = this.configService.get<string>('API_GATEWAY_URL', 'http://localhost:3000');
  }

  private initializeSlackApp() {
    this.app = new App({
      token: this.configService.get<string>('SLACK_BOT_TOKEN'),
      signingSecret: this.configService.get<string>('SLACK_SIGNING_SECRET'),
      socketMode: true,
      appToken: this.configService.get<string>('SLACK_APP_TOKEN'),
    });

    this.webClient = new WebClient(this.configService.get<string>('SLACK_BOT_TOKEN'));

    this.setupCommands();
    this.setupEventHandlers();
  }

  private setupCommands() {
    // /analyze command
    this.app.command('/analyze', async ({ command, ack, respond }) => {
      await ack();
      
      try {
        const query = command.text?.trim();
        if (!query) {
          await respond(this.createErrorResponse('Please provide a query to analyze. Example: /analyze Why is checkout service failing?'));
          return;
        }

        // Send initial response
        await respond({
          response_type: 'ephemeral',
          text: `🔍 Analyzing: "${query}"\n⏳ This may take a few seconds...`,
        });

        // Perform analysis
        const analysis = await this.performIncidentAnalysis(query, command.user_id);
        
        // Send detailed response
        await this.sendAnalysisResponse(command.channel_id, analysis);

      } catch (error) {
        this.logger.error('Error in /analyze command', error);
        await respond(this.createErrorResponse('Sorry, I encountered an error while analyzing the incident. Please try again later.'));
      }
    });

    // /incident command
    this.app.command('/incident', async ({ command, ack, respond }) => {
      await ack();
      
      try {
        const parts = command.text?.trim().split(' ');
        const action = parts?.[0];
        const params = parts?.slice(1).join(' ');

        switch (action) {
          case 'create':
            await this.createIncident(command, respond, params);
            break;
          case 'list':
            await this.listIncidents(command, respond);
            break;
          case 'resolve':
            await this.resolveIncident(command, respond, params);
            break;
          default:
            await respond(this.createIncidentHelpResponse());
        }
      } catch (error) {
        this.logger.error('Error in /incident command', error);
        await respond(this.createErrorResponse('Sorry, I encountered an error while processing the incident command.'));
      }
    });

    // /status command
    this.app.command('/status', async ({ command, ack, respond }) => {
      await ack();
      
      try {
        const status = await this.getSystemStatus();
        await respond(this.createStatusResponse(status));
      } catch (error) {
        this.logger.error('Error in /status command', error);
        await respond(this.createErrorResponse('Sorry, I encountered an error while fetching system status.'));
      }
    });

    // /help command
    this.app.command('/help', async ({ command, ack, respond }) => {
      await ack();
      await respond(this.createHelpResponse());
    });
  }

  private setupEventHandlers() {
    // Handle app mentions (@OpsSage)
    this.app.event('app_mention', async ({ event, say }) => {
      try {
        const text = event.text?.replace(/<@\w+>/g, '').trim();
        if (text) {
          await say({
            text: `🔍 Analyzing your mention: "${text}"`,
            thread_ts: event.ts,
          });

          const analysis = await this.performIncidentAnalysis(text, event.user);
          await this.sendAnalysisResponse(event.channel, analysis, event.ts);
        }
      } catch (error) {
        this.logger.error('Error handling app mention', error);
        await say({
          text: 'Sorry, I encountered an error while processing your request.',
          thread_ts: event.ts,
        });
      }
    });

    // Handle message reactions for quick actions
    this.app.event('reaction_added', async ({ event, say }) => {
      try {
        if (event.reaction === 'eyes' && event.item?.type === 'message') {
          // User reacted with 👀 to analyze message
          const message = await this.webClient.conversations.history({
            channel: event.item.channel,
            latest: event.item.ts,
            limit: 1,
            inclusive: true,
          });

          const messageText = message.messages?.[0]?.text;
          if (messageText) {
            await say({
              text: `🔍 Analyzing message: "${messageText.substring(0, 100)}..."`,
              thread_ts: event.item.ts,
            });

            const analysis = await this.performIncidentAnalysis(messageText, event.user);
            await this.sendAnalysisResponse(event.item.channel, analysis, event.item.ts);
          }
        }
      } catch (error) {
        this.logger.error('Error handling reaction', error);
      }
    });
  }

  private async performIncidentAnalysis(query: string, userId: string): Promise<IncidentAnalysis> {
    const analysisRequest = {
      query,
      services: this.extractServicesFromQuery(query),
      timeRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      userId,
    };

    const response = await this.httpService.axiosRef.post(
      `${this.apiGatewayUrl}/api/v1/ai-engine/analyze`,
      analysisRequest,
    );

    return response.data;
  }

  private extractServicesFromQuery(query: string): string[] {
    const services = ['checkout-service', 'payment-service', 'user-service', 'api-gateway'];
    const foundServices: string[] = [];

    for (const service of services) {
      if (query.toLowerCase().includes(service.toLowerCase())) {
        foundServices.push(service);
      }
    }

    return foundServices.length > 0 ? foundServices : ['checkout-service']; // Default
  }

  private async sendAnalysisResponse(channel: string, analysis: IncidentAnalysis, threadTs?: string) {
    const blocks = this.createAnalysisBlocks(analysis);

    await this.webClient.chat.postMessage({
      channel,
      blocks,
      thread_ts: threadTs,
    });
  }

  private createAnalysisBlocks(analysis: IncidentAnalysis): any[] {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🤖 Incident Analysis Complete',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Query:* ${analysis.query}`,
        },
      },
      {
        type: 'divider',
      },
    ];

    // Root Cause Analysis
    if (analysis.analysis.rootCause) {
      blocks.push(
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🎯 Root Cause Analysis*\n*Hypothesis:* ${analysis.analysis.rootCause.hypothesis}\n*Confidence:* ${analysis.analysis.rootCause.confidence}%`,
          },
        }
      );

      // Evidence
      if (analysis.analysis.rootCause.evidence?.length > 0) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*📊 Evidence:*',
          },
        });

        analysis.analysis.rootCause.evidence.slice(0, 3).forEach(evidence => {
          blocks.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `• *${evidence.type}:* ${evidence.description}\n  *Source:* ${evidence.source} (${evidence.confidence}% confidence)`,
            },
          });
        });
      }
    }

    // Similar Incidents
    if (analysis.analysis.similarIncidents?.length > 0) {
      blocks.push(
        {
          type: 'divider',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🔍 Similar Incidents: ${analysis.analysis.similarIncidents.length} found*`,
          },
        }
      );

      analysis.analysis.similarIncidents.slice(0, 2).forEach(incident => {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `• *${incident.title}*\n  *Similarity:* ${incident.similarity}%\n  *Explanation:* ${incident.explanation}`,
          },
        });
      });
    }

    // Recommendations
    if (analysis.analysis.recommendations?.length > 0) {
      blocks.push(
        {
          type: 'divider',
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*💡 Recommendations:*',
          },
        }
      );

      analysis.analysis.recommendations.slice(0, 3).forEach(rec => {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `• *${rec.title}* (${rec.priority} priority)\n  ${rec.description}\n  *Risk:* ${rec.riskLevel} | *Time:* ${rec.estimatedTime}min`,
          },
        });
      });
    }

    // Actions
    blocks.push(
      {
        type: 'divider',
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🔄 Restart Service',
              emoji: true,
            },
            action_id: 'restart_service',
            value: JSON.stringify({
              analysisId: analysis.id,
              command: analysis.analysis.recommendations?.[0]?.command,
            }),
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '📖 View Runbook',
              emoji: true,
            },
            action_id: 'view_runbook',
            value: analysis.id,
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🔍 Full Analysis',
              emoji: true,
            },
            action_id: 'full_analysis',
            url: `${this.apiGatewayUrl}/incidents/${analysis.id}`,
          },
        ],
      }
    );

    // Metadata
    blocks.push(
      {
        type: 'divider',
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `⏱️ Analysis completed in ${analysis.metadata.analysisDuration}s | 📊 ${analysis.metadata.dataPointsAnalyzed.toLocaleString()} data points analyzed | 🤖 ${analysis.metadata.modelVersion}`,
          },
        ],
      }
    );

    return blocks;
  }

  private async createIncident(command: SlackCommandMiddlewareArgs, respond: any, params: string) {
    if (!params) {
      await respond(this.createErrorResponse('Please provide incident details. Usage: /incident create <title> | <severity> | <service>'));
      return;
    }

    const parts = params.split('|').map(p => p.trim());
    const title = parts[0];
    const severity = parts[1] || 'medium';
    const service = parts[2] || 'unknown';

    try {
      const response = await this.httpService.axiosRef.post(
        `${this.apiGatewayUrl}/api/v1/incidents`,
        {
          title,
          severity,
          service,
          userId: command.user_id,
        },
        {
          headers: {
            'X-User-ID': command.user_id,
          },
        },
      );

      await respond({
        response_type: 'in_channel',
        text: `🚨 Incident Created: *${title}* (ID: ${response.data.id})\n📊 Severity: ${severity} | 🏷️ Service: ${service}\n👤 Assigned to: <@${command.user_id}>`,
      });
    } catch (error) {
      await respond(this.createErrorResponse('Failed to create incident. Please try again.'));
    }
  }

  private async listIncidents(command: SlackCommandMiddlewareArgs, respond: any) {
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.apiGatewayUrl}/api/v1/incidents`,
        {
          params: {
            limit: 5,
            status: 'open',
          },
        },
      );

      const incidents = response.data.incidents;
      if (incidents.length === 0) {
        await respond({
          response_type: 'in_channel',
          text: '✅ No open incidents found.',
        });
        return;
      }

      const incidentList = incidents.map(inc => 
        `• *${inc.title}* (${inc.severity}) - <@${inc.assignee || 'unassigned'}>`
      ).join('\n');

      await respond({
        response_type: 'in_channel',
        text: `📋 Open Incidents (${incidents.length}):\n${incidentList}`,
      });
    } catch (error) {
      await respond(this.createErrorResponse('Failed to fetch incidents.'));
    }
  }

  private async resolveIncident(command: SlackCommandMiddlewareArgs, respond: any, params: string) {
    const incidentId = params?.trim();
    if (!incidentId) {
      await respond(this.createErrorResponse('Please provide incident ID. Usage: /incident resolve <incident-id>'));
      return;
    }

    try {
      await this.httpService.axiosRef.post(
        `${this.apiGatewayUrl}/api/v1/incidents/${incidentId}/resolve`,
        {
          resolution: `Resolved via Slack by <@${command.user_id}>`,
        },
        {
          headers: {
            'X-User-ID': command.user_id,
          },
        },
      );

      await respond({
        response_type: 'in_channel',
        text: `✅ Incident ${incidentId} resolved by <@${command.user_id}>`,
      });
    } catch (error) {
      await respond(this.createErrorResponse('Failed to resolve incident.'));
    }
  }

  private async getSystemStatus() {
    try {
      const [health, incidents] = await Promise.all([
        this.httpService.axiosRef.get(`${this.apiGatewayUrl}/api/v1/health`),
        this.httpService.axiosRef.get(`${this.apiGatewayUrl}/api/v1/incidents/stats/summary`),
      ]);

      return {
        health: health.data,
        incidents: incidents.data,
      };
    } catch (error) {
      return {
        health: { status: 'unhealthy' },
        incidents: { total: 0, byStatus: {} },
      };
    }
  }

  private createStatusResponse(status: any): SlackCommandResponse {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 OpsSage System Status',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*System Health:* ${status.health.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}\n*Total Incidents:* ${status.incidents.total}\n*Open Incidents:* ${status.incidents.byStatus?.open || 0}\n*Resolved Today:* ${status.incidents.byStatus?.resolved || 0}`,
        },
      },
    ];

    return {
      response_type: 'in_channel',
      blocks,
    };
  }

  private createHelpResponse(): SlackCommandResponse {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🤖 OpsSage Bot Help',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Available Commands:*\n\n• `/analyze <query>` - AI-powered incident analysis\n• `/incident create <title> | <severity> | <service>` - Create new incident\n• `/incident list` - List open incidents\n• `/incident resolve <id>` - Resolve incident\n• `/status` - Show system status\n• `/help` - Show this help message',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Quick Actions:*\n\n• Mention @OpsSage in any message to analyze it\n• React with 👀 to any message for quick analysis\n• Use buttons in analysis responses for actions',
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '💡 *Tip:* The more specific your query, the better the analysis. Include service names and error details.',
          },
        ],
      },
    ];

    return {
      response_type: 'ephemeral',
      blocks,
    };
  }

  private createIncidentHelpResponse(): SlackCommandResponse {
    return {
      response_type: 'ephemeral',
      text: 'Usage: `/incident <action> [parameters]`\n\nActions:\n• `create <title> | <severity> | <service>` - Create incident\n• `list` - List open incidents\n• `resolve <id>` - Resolve incident\n\nExample: `/incident create Checkout service failing | high | checkout-service`',
    };
  }

  private createErrorResponse(message: string): SlackCommandResponse {
    return {
      response_type: 'ephemeral',
      text: `❌ ${message}`,
    };
  }

  getApp(): App {
    return this.app;
  }

  getWebClient(): WebClient {
    return this.webClient;
  }
}
