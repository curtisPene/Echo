import { ServiceResult } from "../../../types";
import { RepoError } from "../../../errors/RepoError";
import { DomainError } from "../../../errors/DomainError";
import { RoomDTO } from "../entities/room";
import { RoomRepository } from "../ports/RoomRepository";
import { AuthAndAccessSocket } from "../../authAndAccess/ports/AuthAndAccessSocket";
import { IdentityDTO } from "../../authAndAccess/domainModels/identity";
import { DeleteRoomService } from "./DeleteRoomService";
import { RemoveParticipantFromRoomService } from "./RemoveParticipantFromRoomService";
import { DeleteRoomMessagesService } from "../../messaging/services/DeleteRoomMessagesService";
import { RedactUserMessagesInRoomService } from "../../messaging/services/RedactUserMessagesInRoomService";

export type UpdateRoomInviteResult =
  { roomDeleted: true; roomId: string } | { roomDeleted: false; room: RoomDTO };

/**
 * Also doubles as "leave room" for an already-accepted participant, not
 * just declining a still-pending invite. There's no separate concept to
 * build: a room invite IS pending membership (Room.create/addParticipant
 * add the invitee to the room immediately, just with status "pending"), so
 * declining and leaving are the same operation - "remove me from this
 * room" - regardless of which status I was at when I called it. Neither
 * Room.removeParticipant nor the 1:1-deletes-the-room rule below checks
 * status, so no extra branching was needed to support leaving.
 */
export class UpdateRoomInviteService {
  constructor(
    private readonly roomRepo: RoomRepository,
    private readonly socket: AuthAndAccessSocket,
    private readonly deleteRoomService: DeleteRoomService,
    private readonly deleteRoomMessagesService: DeleteRoomMessagesService,
    private readonly redactUserMessagesInRoomService: RedactUserMessagesInRoomService,
    private readonly removeParticipantFromRoomService: RemoveParticipantFromRoomService,
  ) {}

  async execute({
    user,
    roomId,
    isAcceptRequest,
  }: {
    user: IdentityDTO;
    roomId: string;
    isAcceptRequest: boolean;
  }): Promise<ServiceResult<UpdateRoomInviteResult>> {
    try {
      const room = await this.roomRepo.findById({ roomId });

      if (!room) {
        return { success: false, message: "Room not found", data: null };
      }

      // Declining a 1:1 invite leaves no one meaningful behind - dissolve
      // the whole room (and its messages) rather than shrinking it to a
      // single dangling participant, matching how DeleteUserAccountService
      // already treats leaving a 1:1 room.
      if (!isAcceptRequest && room.isOneOnOne()) {
        await this.deleteRoomService.execute({ roomId });
        await this.deleteRoomMessagesService.execute({ roomId });

        const otherParticipants = room
          .getParticipants()
          .filter((participant) => participant.userId !== user.id);

        await Promise.all(
          otherParticipants.map((participant) =>
            this.socket.emitToUser({
              userId: participant.userId,
              event: "room:deleted",
              payload: { roomId },
            }),
          ),
        );

        return {
          success: true,
          message: "Room deleted successfully",
          data: { roomDeleted: true, roomId },
        };
      }

      let roomView: RoomDTO;

      if (isAcceptRequest) {
        const updated = room.acceptParticipant(user.id);
        const saved = await this.roomRepo.update(updated);
        roomView = saved.toDTO();
      } else {
        const removeResult =
          await this.removeParticipantFromRoomService.execute({
            roomId,
            userId: user.id,
          });

        if (!removeResult.success || !removeResult.data) {
          return {
            success: false,
            message: removeResult.message,
            data: null,
          };
        }

        roomView = removeResult.data;

        await this.redactUserMessagesInRoomService.execute({
          userId: user.id,
          roomId,
        });
      }

      const otherParticipants = roomView.participants.filter(
        (participant) => participant.userId !== user.id,
      );

      await Promise.all(
        otherParticipants.map((participant) =>
          this.socket.emitToUser({
            userId: participant.userId,
            event: "room:updated",
            payload: { room: roomView },
          }),
        ),
      );

      return {
        success: true,
        message: "Participant updated successfully",
        data: { roomDeleted: false, room: roomView },
      };
    } catch (error) {
      if (error instanceof DomainError) {
        const message = isAcceptRequest
          ? "Looks like this invite has already been accepted"
          : error.message;
        return { success: false, message, data: null };
      }

      if (error instanceof RepoError) {
        console.error("[Repo]", error.message);
      } else {
        console.error(error);
      }
      return { success: false, message: "Internal server error", data: null };
    }
  }
}
