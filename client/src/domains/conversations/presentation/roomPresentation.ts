import { Room } from "../domainModels/room";
import type { RoomDTO, ParticipantDTO } from "../types";

export type RoomPresentation = {
  id: string;
  name: string;
  participants: ParticipantDTO[];
  myStatus: "pending" | "accepted";
  isOneOnOne: boolean;
};

export function toRoomPresentation(
  dto: RoomDTO,
  ctx: { currentUserId: string },
): RoomPresentation {
  const room = Room.hydrate(dto);

  return {
    id: room.id,
    name: room.name,
    participants: room.getParticipants(),
    myStatus: room.statusFor(ctx.currentUserId),
    isOneOnOne: room.isOneOnOne(),
  };
}

export function getOtherParticipants(
  participants: ParticipantDTO[],
  currentUserId: string,
): ParticipantDTO[] {
  return participants.filter((p) => p.userId !== currentUserId);
}
