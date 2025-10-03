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
import { Logger, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MarkReadDto } from './dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private userSockets = new Map<string, Set<string>>();

  constructor(private readonly notificationService: NotificationService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId || client.handshake.query?.userId;
    
    if (!userId) {
      this.logger.warn(`Client ${client.id} connected without userId`);
      client.disconnect();
      return;
    }

    if (!this.userSockets.has(userId as string)) {
      this.userSockets.set(userId as string, new Set());
    }
    this.userSockets.get(userId as string).add(client.id);

    client.join(`user:${userId}`);

    this.logger.log(
      `Client ${client.id} connected for user ${userId} (Total connections: ${this.userSockets.get(userId as string).size})`,
    );

    this.sendUnreadCount(userId as string);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketIds] of this.userSockets.entries()) {
      if (socketIds.has(client.id)) {
        socketIds.delete(client.id);
        if (socketIds.size === 0) {
          this.userSockets.delete(userId);
        }
        this.logger.log(`Client ${client.id} disconnected for user ${userId}`);
        break;
      }
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: MarkReadDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.auth?.userId || client.handshake.query?.userId;
    
    if (!userId) {
      return { success: false, message: 'User not authenticated' };
    }

    const result = await this.notificationService.markAsRead(data, userId as string);
    
    this.sendUnreadCount(userId as string);

    return result;
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.auth?.userId || client.handshake.query?.userId;
    
    if (!userId) {
      return { success: false, message: 'User not authenticated' };
    }

    const result = await this.notificationService.markAllAsRead(userId as string);
    
    this.sendUnreadCount(userId as string);

    return result;
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.auth?.userId || client.handshake.query?.userId;
    
    if (!userId) {
      return { count: 0 };
    }

    return this.notificationService.getUnreadCount(userId as string);
  }

  sendToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Notification sent to user ${userId}`);
  }

  async broadcastToAdmins(notification: any) {
    const admins = await this.notificationService.getAdminUsers();
    
    for (const admin of admins) {
      this.sendToUser(admin.id, notification);
    }
    
    this.logger.log(`Notification broadcast to ${admins.length} admins`);
  }

  private async sendUnreadCount(userId: string) {
    const { count } = await this.notificationService.getUnreadCount(userId);
    this.server.to(`user:${userId}`).emit('unreadCount', { count });
  }
}