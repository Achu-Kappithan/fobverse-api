import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
class Participant {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  peerId?: string;

  @Prop({ default: Date.now })
  joinedAt: Date;
}

export type VideoCallRoomDocument = HydratedDocument<VideoCallRoom>;

@Schema({ timestamps: true })
export class VideoCallRoom {
  @Prop({ required: true, unique: true })
  roomId: string;

  @Prop({ type: Types.ObjectId, ref: 'Interview', required: true })
  interviewId: Types.ObjectId;

  @Prop({ type: [Participant], default: [] })
  participants: Participant[];

  @Prop({ default: true })
  isActive: boolean;
}

export const VideoCallRoomSchema = SchemaFactory.createForClass(VideoCallRoom);
