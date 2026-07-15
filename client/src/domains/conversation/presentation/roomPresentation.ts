import type { Room, RoomParticipant } from "@/domains/presence/types";

export type RoomPresentation = {
  id: string;
  name: string;
  otherParticipants: RoomParticipant["user"][];
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

  const otherParticipants = room.participants
    .filter((participant) => participant.user.id !== ctx.currentUserId)
    .map((participant) => participant.user);

  return {
    id: room.id,
    name: room.name,
    otherParticipants,
    myStatus: myParticipant?.status ?? "pending",
    isOneOnOne: room.participants.length === 2,
  };
}
