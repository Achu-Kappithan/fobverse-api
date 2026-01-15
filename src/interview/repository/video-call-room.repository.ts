import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  VideoCallRoom,
  VideoCallRoomDocument,
} from '../schema/video-call-room.schema';
import { IVideoCallRoomRepository } from '../interfaces/video-call-room.repository.interface';

@Injectable()
export class VideoCallRoomRepository implements IVideoCallRoomRepository {
  constructor(
    @InjectModel(VideoCallRoom.name)
    private videoCallRoomModel: Model<VideoCallRoomDocument>,
  ) {}

  async create(
    roomData: Partial<VideoCallRoom>,
  ): Promise<VideoCallRoomDocument> {
    const room = new this.videoCallRoomModel(roomData);
    return room.save();
  }

  async findByRoomId(roomId: string): Promise<VideoCallRoomDocument | null> {
    return this.videoCallRoomModel.findOne({ roomId }).exec();
  }

  async findByInterviewId(
    interviewId: string,
  ): Promise<VideoCallRoomDocument | null> {
    return this.videoCallRoomModel.findOne({ interviewId }).exec();
  }

  async addParticipant(
    roomId: string,
    participant: { userId: string; name: string; peerId?: string },
  ): Promise<VideoCallRoomDocument | null> {
    return this.videoCallRoomModel
      .findOneAndUpdate(
        { roomId },
        {
          $push: {
            participants: {
              ...participant,
              joinedAt: new Date(),
            },
          },
        },
        { new: true },
      )
      .exec();
  }

  async removeParticipant(
    roomId: string,
    userId: string,
  ): Promise<VideoCallRoomDocument | null> {
    return this.videoCallRoomModel
      .findOneAndUpdate(
        { roomId },
        { $pull: { participants: { userId } } },
        { new: true },
      )
      .exec();
  }
}
