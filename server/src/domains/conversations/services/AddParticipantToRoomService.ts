import { ServiceResult } from "../../../types";
import { RepoError } from "../../../errors/RepoError";
import { DomainError } from "../../../errors/DomainError";
import { VerifyUserIdService } from "../../authAndAccess/services/VerifyUserIdService";
import { GetUsersContactsService } from "../../authAndAccess/services/GetUsersContactsService";
import { FindUserIdentitiesService } from "../../authAndAccess/services/FindUserIdentitiesService";
import { RoomDTO } from "../entities/room";
import { RoomRepository } from "../ports/RoomRepository";
import { AuthAndAccessSocket } from "../../authAndAccess/ports/AuthAndAccessSocket";
import { IdentityDTO } from "../../authAndAccess/domainModels/identity";

export class AddParticipantToRoomService {
  constructor(
    private readonly roomRepo: RoomRepository,
    private readonly verifyUserIdService: VerifyUserIdService,
    private readonly getUsersContactsService: GetUsersContactsService,
    private readonly findUserIdentitiesService: FindUserIdentitiesService,
    private readonly socket: AuthAndAccessSocket,
  ) {}

  async execute({
    user,
    roomId,
    participantId,
  }: {
    user: IdentityDTO;
    roomId: string;
    participantId: string;
  }): Promise<ServiceResult<RoomDTO>> {
    try {
      const room = await this.roomRepo.findById({ roomId });

      if (!room) {
        return { success: false, message: "Room not found", data: null };
      }

      if (!room.hasParticipant(user.id)) {
        return { success: false, message: "Not a participant of this room", data: null };
      }

      const exists = await this.verifyUserIdService.execute({
        userId: participantId,
      });

      if (!exists) {
        return { success: false, message: "User not found", data: null };
      }

      const existingParticipantIds = room
        .getParticipants()
        .map((participant) => participant.userId);

      const [newParticipantContacts, existingContactsResults] = await Promise.all([
        this.getUsersContactsService.execute({ userId: participantId }),
        Promise.all(
          existingParticipantIds.map((id) =>
            this.getUsersContactsService.execute({ userId: id }),
          ),
        ),
      ]);

      const existingParticipantBlockedIds = new Map(
        existingParticipantIds.map((id, index) => [
          id,
          existingContactsResults[index].blocked.map((c) => c.userId),
        ]),
      );

      const canAddResult = room.canAddParticipant({
        newParticipantId: participantId,
        newParticipantBlockedIds: newParticipantContacts.blocked.map(
          (c) => c.userId,
        ),
        existingParticipantBlockedIds,
      });

      if (!canAddResult.allowed) {
        const message =
          canAddResult.reason === "new_participant_blocked_existing"
            ? "This user has blocked someone already in this conversation"
            : "Someone already in this conversation has blocked this user";

        return { success: false, message, data: null };
      }

      const [identity] = await this.findUserIdentitiesService.execute({
        userIds: [participantId],
      });

      if (!identity) {
        return { success: false, message: "Internal server error", data: null };
      }

      const updated = room.addParticipant(identity);
      const saved = await this.roomRepo.update(updated);
      const roomView = saved.toDTO();

      // The new participant's currently-connected sockets need to join the
      // room live, the same as AddContactService does for a brand-new 1:1 -
      // otherwise they can't receive/send in it until their next reconnect.
      await this.socket.joinRoom({ userId: participantId, roomId });

      const recipients = roomView.participants.filter(
        (participant) => participant.userId !== user.id,
      );

      await Promise.all(
        recipients.map((participant) =>
          this.socket.emitToUser({
            userId: participant.userId,
            event: "room:updated",
            payload: { room: roomView },
          }),
        ),
      );

      return {
        success: true,
        message: "Participant added successfully",
        data: roomView,
      };
    } catch (error) {
      if (error instanceof DomainError) {
        return { success: false, message: error.message, data: null };
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
