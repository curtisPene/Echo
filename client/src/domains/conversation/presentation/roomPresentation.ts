import type { Room, RoomParticipant } from "@/domains/presence/types";

export type RoomPresentation = {
  id: string;
  name: string;
  participants: RoomParticipant[];
  myStatus: "pending" | "accepted";
  isOneOnOne: boolean;
};

export function toRoomPresentation(
  room: Room,
  ctx: { currentUserId: string },
): RoomPresentation {
  const myParticipant = room.participants.find(
    (participant) => participant.user.id === ctx.currentUserId,
  );

  return {
    id: room.id,
    name: room.name,
    participants: room.participants,
    myStatus: myParticipant?.status ?? "pending",
    isOneOnOne: room.participants.length === 2,
  };
}

export function getOtherParticipants(
  participants: RoomParticipant[],
  currentUserId: string,
) {
  return participants
    .filter((participant) => participant.user.id !== currentUserId)
    .map((participant) => participant.user);
}
