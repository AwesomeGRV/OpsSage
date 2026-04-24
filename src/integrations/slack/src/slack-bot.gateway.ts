import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SlackBotGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SlackBotGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe-to-analysis')
  handleAnalysisSubscription(
    @MessageBody() data: { incidentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`analysis-${data.incidentId}`);
    this.logger.log(`Client ${client.id} subscribed to analysis for incident ${data.incidentId}`);
  }

  @SubscribeMessage('unsubscribe-from-analysis')
  handleAnalysisUnsubscription(
    @MessageBody() data: { incidentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`analysis-${data.incidentId}`);
    this.logger.log(`Client ${client.id} unsubscribed from analysis for incident ${data.incidentId}`);
  }

  // Method to broadcast analysis results
  broadcastAnalysisResult(incidentId: string, result: any) {
    this.server.to(`analysis-${incidentId}`).emit('analysis-result', result);
  }

  // Method to broadcast incident updates
  broadcastIncidentUpdate(incidentId: string, update: any) {
    this.server.to(`analysis-${incidentId}`).emit('incident-update', update);
  }
}
