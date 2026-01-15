import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
export class VideoCallGateway implements OnGatewayDisconnect {
  private readonly _logger = new Logger(VideoCallGateway.name);
  @WebSocketServer()
  server: Server;

  private roomParticipants = new Map<
    string,
    Map<string, { userId: string; peerId: string; name: string }>
  >();

  private socketToUser = new Map<string, { roomId: string; userId: string }>();

  @SubscribeMessage('send-peer-id')
  handlePeerId(
    @MessageBody() data: { peerId: string; interviewId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.interviewId).emit('receive-peer-id', data.peerId);
  }

  @SubscribeMessage('join-video-room')
  async handleJoinRoom(
    @MessageBody()
    data: { roomId: string; userId: string; peerId: string; name: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = data.roomId.trim();
    this._logger.log(
      `[VideoCall] User ${data.name} (${data.userId}) joining room: "${roomId}" with socket ${client.id}`,
    );

    await client.join(roomId);

    this.socketToUser.set(client.id, {
      roomId: data.roomId,
      userId: data.userId,
    });

    if (!this.roomParticipants.has(roomId)) {
      this.roomParticipants.set(roomId, new Map());
    }
    const participants = this.roomParticipants.get(roomId)!;
    const existingParticipants = Array.from(participants.values());

    participants.set(data.userId, {
      userId: data.userId,
      peerId: data.peerId,
      name: data.name,
    });

    client.to(roomId).emit('user-joined-video', {
      ...data,
      roomSize: participants.size,
    });

    client.emit('room-joined', {
      roomId,
      roomSize: participants.size,
      otherPeers: existingParticipants,
    });

    this._logger.log(
      `[VideoCall] User ${data.name} joined. Room "${roomId}" now has ${participants.size} participant(s). Sent ${existingParticipants.length} otherPeers to joiner.`,
    );
  }

  @SubscribeMessage('leave-video-room')
  async handleLeaveRoom(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = data.roomId.trim();
    this._logger.log(`[VideoCall] User ${data.userId} leaving room: ${roomId}`);

    let count = 0;
    const room = this.roomParticipants.get(roomId);
    if (room) {
      room.delete(data.userId);
      count = room.size;
      if (count === 0) {
        this.roomParticipants.delete(roomId);
      }
    }

    this.socketToUser.delete(client.id);

    await client.leave(roomId);
    client.to(roomId).emit('user-left-video', {
      ...data,
      roomSize: count,
    });
    this._logger.log(
      `[VideoCall] User Left. Room "${roomId}" now has ${count} participant(s).`,
    );
  }

  handleDisconnect(client: Socket) {
    const userInfo = this.socketToUser.get(client.id);

    if (!userInfo) {
      return;
    }

    const { roomId, userId } = userInfo;
    this._logger.log(
      `[VideoCall] Socket ${client.id} disconnected. Cleaning up user ${userId} from room ${roomId}`,
    );

    const room = this.roomParticipants.get(roomId);
    if (room) {
      const participant = room.get(userId);
      room.delete(userId);
      const count = room.size;

      if (count === 0) {
        this.roomParticipants.delete(roomId);
      }

      if (participant) {
        this.server.to(roomId).emit('user-left-video', {
          roomId,
          userId,
          name: participant.name,
          roomSize: count,
        });
      }

      this._logger.log(
        `[VideoCall] Auto-cleanup complete. Room "${roomId}" now has ${count} participant(s).`,
      );
    }

    this.socketToUser.delete(client.id);
  }

  @SubscribeMessage('video-message')
  handleVideoMessage(
    @MessageBody()
    data: {
      roomId: string;
      userId: string;
      name: string;
      message: string;
    },
  ) {
    const roomId = data.roomId.trim();
    this._logger.log(
      `[VideoCall] Message in ${roomId} from ${data.name}: ${data.message}`,
    );
    this.server.to(roomId).emit('video-message', {
      ...data,
      timestamp: new Date(),
    });
  }
}
