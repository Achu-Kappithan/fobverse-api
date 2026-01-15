import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVideoRoomDto {
  @IsNotEmpty()
  @IsString()
  interviewId: string;

  @IsNotEmpty()
  @IsString()
  roomId: string;
}

export class JoinRoomDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  peerId?: string;
}

export class ChatMessageDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}

export class VideoRoomResponseDto {
  roomId: string;
  interviewId: string;
  participants: {
    userId: string;
    name: string;
    peerId?: string;
    joinedAt: Date;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
