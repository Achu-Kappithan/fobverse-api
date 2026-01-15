import {
  VideoCallRoom,
  VideoCallRoomDocument,
} from '../schema/video-call-room.schema';

export const VIDEO_CALL_ROOM_REPOSITORY = 'VIDEO_CALL_ROOM_REPOSITORY';

export interface IVideoCallRoomRepository {
  create(roomData: Partial<VideoCallRoom>): Promise<VideoCallRoomDocument>;
  findByRoomId(roomId: string): Promise<VideoCallRoomDocument | null>;
  findByInterviewId(interviewId: string): Promise<VideoCallRoomDocument | null>;
  addParticipant(
    roomId: string,
    participant: { userId: string; name: string; peerId?: string },
  ): Promise<VideoCallRoomDocument | null>;
  removeParticipant(
    roomId: string,
    userId: string,
  ): Promise<VideoCallRoomDocument | null>;
}
