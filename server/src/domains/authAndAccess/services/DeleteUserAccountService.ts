import { RepoError } from "../../../errors/RepoError";
import { ServiceResult } from "../../../types";
import { ContactsRepository } from "../ports/ContactsRepository";
import { UserRepository } from "../ports/UserRepository";
import type { AuthAndAccessSocket } from "../ports/AuthAndAccessSocket";
import { IdentityDTO } from "../domainModels/identity";
import { RoomDTO } from "../../conversations/domainModels/room";
import { FindRoomsForUserService } from "../../conversations/services/FindRoomsForUserService";
import { RemoveParticipantFromRoomService } from "../../conversations/services/RemoveParticipantFromRoomService";
import { DeleteRoomService } from "../../conversations/services/DeleteRoomService";
import { DeleteRoomMessagesService } from "../../messaging/services/DeleteRoomMessagesService";
import { RedactUserMessagesInRoomService } from "../../messaging/services/RedactUserMessagesInRoomService";

export type DeletedRoomResult =
  | { roomId: string }
  | { roomId: string; room: RoomDTO };

export class DeleteUserAccountService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly contactsRepo: ContactsRepository,
    private readonly socket: AuthAndAccessSocket,
    private readonly findRoomsForUserService: FindRoomsForUserService,
    private readonly removeParticipantFromRoomService: RemoveParticipantFromRoomService,
    private readonly deleteRoomService: DeleteRoomService,
    private readonly deleteRoomMessagesService: DeleteRoomMessagesService,
    private readonly redactUserMessagesInRoomService: RedactUserMessagesInRoomService,
  ) {}

  async execute({ user }: { user: IdentityDTO }): Promise<
    ServiceResult<{
      deletedUserId: string;
      rooms: DeletedRoomResult[];
      affectedParticipantIds: string[];
    }>
  > {
    try {
      const userId = user.id;

      const existingUser = await this.userRepo.findById({ id: userId });

      if (!existingUser)
        return { success: false, message: "User not found", data: null };

      // Find every room the user's in and either dissolve it (1:1) or
      // remove them and redact their leftover messages (group) - same
      // per-room logic blockContactService uses, just applied to every
      // shared room instead of only the ones shared with one other user.
      const rooms = await this.findRoomsForUserService.execute({ userId });

      const updatedRoomData = await Promise.all(
        rooms.map(async (room) => {
          const roomId = room.id;
          const isOneOnOne = room.participants.length === 2;

          if (isOneOnOne) {
            await this.deleteRoomService.execute({ roomId });
            await this.deleteRoomMessagesService.execute({ roomId });

            const deletedRoom: DeletedRoomResult = { roomId };
            return { deletedRoom, remainingParticipantIds: [] };
          }

          const removeResult = await this.removeParticipantFromRoomService.execute({
            roomId,
            userId,
          });
          await this.redactUserMessagesInRoomService.execute({ userId, roomId });

          if (!removeResult.success || !removeResult.data) {
            const deletedRoom: DeletedRoomResult = { roomId };
            return { deletedRoom, remainingParticipantIds: [] };
          }

          const deletedRoom: DeletedRoomResult = { roomId, room: removeResult.data };

          return {
            deletedRoom,
            remainingParticipantIds: removeResult.data.participants.map(
              (p) => p.userId,
            ),
          };
        }),
      );

      const affectedRooms = updatedRoomData.map((data) => data.deletedRoom);

      const reducedParticipantIds: string[] = [];
      updatedRoomData.forEach((data) => {
        reducedParticipantIds.push(...data.remainingParticipantIds);
      });

      const affectedParticipantIds = Array.from(new Set(reducedParticipantIds));

      // Remove the user from every other user's contacts/blocked lists,
      // then delete their own contacts doc and user doc.
      await this.contactsRepo.removeUserFromAllLists({ userId });
      await this.contactsRepo.delete({ userId });
      await this.userRepo.delete({ id: userId });

      // The deleted user's own sockets are gone entirely - disconnect them
      // rather than leave individual rooms.
      await this.socket.disconnectUser({ userId });

      // Notify every remaining group member so their client re-syncs the
      // affected rooms - 1:1 rooms are gone entirely (room:deleted, no
      // RoomDTO left), group rooms still exist with the deleted user removed
      // (room:updated with the fresh RoomDTO).
      await Promise.all(
        affectedParticipantIds.flatMap((participantId) =>
          affectedRooms.map((room) =>
            "room" in room
              ? this.socket.emitToUser({
                  userId: participantId,
                  event: "room:updated",
                  payload: { room: room.room },
                })
              : this.socket.emitToUser({
                  userId: participantId,
                  event: "room:deleted",
                  payload: { roomId: room.roomId },
                }),
          ),
        ),
      );

      return {
        success: true,
        message: "Account deleted successfully",
        data: {
          deletedUserId: userId,
          rooms: affectedRooms,
          affectedParticipantIds,
        },
      };
    } catch (error) {
      if (error instanceof RepoError) {
        console.error("[Repo]", error.message);
      } else {
        console.log(error);
      }
      return { success: false, message: "Internal Server Error", data: null };
    }
  }
}
