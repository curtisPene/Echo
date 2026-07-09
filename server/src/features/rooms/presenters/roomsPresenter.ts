import { userPresenter } from "../../users/presenters/usersPresenter";
import { RoomWithPopulatedParticipants } from "../repo/mongooseRoomRepo";

export const roomPresenter = ({
  room,
}: {
  room: RoomWithPopulatedParticipants;
}) => {
  return {
    id: room._id.toString(),
    participants: room.participants.map((participant) => ({
      user: userPresenter(participant.user),
      status: participant.status,
      lastReadAt: participant.lastReadAt?.toISOString() ?? null,
    })),
    name: room.name,
  };
};

export type RoomView = ReturnType<typeof roomPresenter>;
