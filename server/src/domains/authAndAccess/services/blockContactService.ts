import { RepoError } from "../../../errors/RepoError";
import { ServiceResult } from "../../../types";
import { ContactsRepository } from "../ports/ContactsRepository";
import { UserRepository } from "../ports/UserRepository";
import type { AuthAndAccessSocket } from "../ports/AuthAndAccessSocket";
import { ContactsDTO } from "../domainModels/contacts";
import { RoomDTO } from "../../conversations/domainModels/room";
import { FindRoomsForUserService } from "../../conversations/services/FindRoomsForUserService";
import { RemoveParticipantFromRoomService } from "../../conversations/services/RemoveParticipantFromRoomService";
import { DeleteRoomService } from "../../conversations/services/DeleteRoomService";
import { DeleteRoomMessagesService } from "../../messaging/services/DeleteRoomMessagesService";
import { RedactUserMessagesInRoomService } from "../../messaging/services/RedactUserMessagesInRoomService";

export type BlockedRoomResult =
  | { roomId: string }
  | { roomId: string; room: RoomDTO };

export class BlockContactService {
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

  async execute({
    user,
    blockedUser,
  }: {
    user: string;
    blockedUser: string;
  }): Promise<
    ServiceResult<{
      blocker: ContactsDTO;
      blocked: ContactsDTO;
      rooms: BlockedRoomResult[];
      affectedParticipantIds: string[];
    }>
  > {
    try {
      const blockedUserEntity = await this.userRepo.findById({ id: blockedUser });

      if (!blockedUserEntity)
        return { success: false, message: "User not found", data: null };

      const userEntity = await this.userRepo.findById({ id: user });

      if (!userEntity)
        return { success: false, message: "Internal server error", data: null };

      // Mutually delete the two users from their contacts lists, add the
      // blocked user to the blocker's blocked list
      const blockerContacts = await this.contactsRepo.findByUserId({ userId: user });
      const blockedContacts = await this.contactsRepo.findByUserId({ userId: blockedUser });

      const updatedDocs = await this.contactsRepo.saveBlockPair({
        blocker: blockerContacts.block(blockedUserEntity),
        blocked: blockedContacts.removeContact(user),
      });

      // Find all the rooms the user shares with the blocked user and remove the
      // user from that room or delete if its a one on one chat
      const rooms = await this.findRoomsForUserService.execute({ userId: user });

      const updatedRoomData = await Promise.all(
        rooms.map(async (room) => {
          const roomIncludesBlockedContact = room.participants.some(
            (participant) => participant.userId === blockedUser,
          );

          if (!roomIncludesBlockedContact) return null;

          const roomId = room.id;
          const isOneOnOne = room.participants.length === 2;

          // If the room is one on one delete the room and all the associated messages
          // otherwise remove the blocker from the room and redact their leftover messages
          if (isOneOnOne) {
            await this.deleteRoomService.execute({ roomId });
            await this.deleteRoomMessagesService.execute({ roomId });

            const blockedRoom: BlockedRoomResult = { roomId };
            return { blockedRoom, remainingParticipantIds: null };
          }

          const updatedRoom = await this.removeParticipantFromRoomService.execute({
            roomId,
            userId: user,
          });
          await this.redactUserMessagesInRoomService.execute({ userId: user, roomId });

          if (!updatedRoom) return null;

          const blockedRoom: BlockedRoomResult = {
            roomId,
            room: updatedRoom,
          };

          return {
            blockedRoom,
            remainingParticipantIds: updatedRoom.participants.map((p) => p.userId),
          };
        }),
      );

      const affectedRooms = updatedRoomData
        .filter((data): data is NonNullable<typeof data> => data !== null)
        .map((data) => data.blockedRoom);

      const reducedParticipantIds: string[] = [];
      updatedRoomData.forEach((data) => {
        if (!data || !data.remainingParticipantIds) return;

        reducedParticipantIds.push(...data.remainingParticipantIds);
      });

      // Dedupe by id so a user in multiple shared rooms only appears once
      const affectedParticipantIds = Array.from(new Set(reducedParticipantIds));

      // The blocker is the one removed from every affected room (1:1 deleted,
      // or pulled from group participants) - their sockets always need to
      // leave. The blocked user is only removed from the room in the 1:1
      // case (room deleted entirely); in a group chat the blocked user stays
      // a participant, so their sockets stay joined.
      await Promise.all(
        affectedRooms.map(async (room) => {
          await this.socket.leaveRoom({ userId: user, roomId: room.roomId });

          if (!("room" in room)) {
            await this.socket.leaveRoom({ userId: blockedUser, roomId: room.roomId });
          }
        }),
      );

      // Notify every remaining group member (already deduplicated) so their
      // client re-syncs the affected rooms without receiving the event more
      // than once, even if they share multiple group rooms with the blocker.
      // 1:1 rooms are deleted (no RoomDTO left to send, just the id to
      // remove locally); group rooms still exist with the blocker removed,
      // so they get a normal room:updated with the fresh RoomDTO.
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
        message: "Contact blocked successfully",
        data: {
          blocker: updatedDocs.blocker.toDTO(),
          blocked: updatedDocs.blocked.toDTO(),
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
