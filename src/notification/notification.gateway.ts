import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import { ConfigService } from '@nestjs/config';
import { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
export class NotificationGateWay
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>();
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    const cookieHeader = client.handshake.headers.cookie;

    if (!cookieHeader) {
      console.log('No cookies found');
      client.disconnect();
      return;
    }

    const cookies = cookie.parse(cookieHeader);
    const token = cookies['access_token'];
    console.log('token get from the cookie', token);

    if (!token) {
      console.log('JWT not found in cookie');
      client.disconnect();
      return;
    }

    if (!token) {
      client.disconnect();
      return;
    }
    const verificationSecret =
      this._configService.get<string>('JWT_ACCESS_SECRET');
    const payload: JwtAccessPayload = this._jwtService.verify(token, {
      secret: verificationSecret,
    });
    console.log('data  get payload for sockent', payload);

    const candidateId = payload.UserId?.toString();

    this.connectedUsers.set(candidateId, client.id);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`Candidate disconnected: ${userId}`);
        break;
      }
    }
  }

  sendNotificationToCandidate(candidateId: string, payload: any) {
    console.log('send notificaion works');
    const socketId = this.connectedUsers.get(candidateId);
    console.log('socket id gets ', socketId);

    if (!socketId) return;

    this.server.to(socketId).emit('notification', payload);
  }
}
