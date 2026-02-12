import { Types } from 'mongoose';

export interface VideoRoomResponseInterface {
  _id?: Types.ObjectId;
  roomId: string;
  interviewId: string;
  participants: {
    userId: string;
    name: string;
    peerId?: string;
    joinedAt: Date;
  }[];
  isActive: boolean;
}
