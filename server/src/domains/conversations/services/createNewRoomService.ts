import mongoose from "mongoose";
import { ServiceResult } from "../../../types";
import { RepoError } from "../../../errors/RepoError";
import { VerifyUserIdService } from "../../authAndAccess/services/VerifyUserIdService";
import { GetUsersContactsService } from "../../authAndAccess/services/GetUsersContactsService";
import { FindUserIdentitiesService } from "../../authAndAccess/services/FindUserIdentitiesService";
import { Room, RoomDTO } from "../entities/room";
import { RoomRepository } from "../ports/RoomRepository";
import { IdentityDTO } from "../../authAndAccess/domainModels/identity";

export class CreateNewRoomService {
  constructor(
    private readonly verifyUserIdService: VerifyUserIdService,
    private readonly getUsersContactsService: GetUsersContactsService,
    private readonly findUserIdentitiesService: FindUserIdentitiesService,
    private readonly roomRepo: RoomRepository,
  ) {}

  async execute({
    user,
    participants,
    name,
  }: {
    user: IdentityDTO;
    participants: { id: string }[];
    name: string;
  }): Promise<ServiceResult<RoomDTO>> {
    try {
      const participantIds = participants.map((participant) => participant.id);

      // Ensure all participants exist, return success false if not
      const existenceChecks = await Promise.all(
        participantIds.map((id) =>
          this.verifyUserIdService.execute({ userId: id }),
        ),
      );

      if (existenceChecks.some((exists) => !exists))
        return {
          success: false,
          message: "One or more participants could not be found",
          data: null,
        };

      // If this is a one-on-one room (or a self-chat), does it already
      // exist? We can create multiple group chats with the same
      // participants but 1:1s/self-chats need to stay unique.
      if (participants.length === 1) {
        const [participantId] = participantIds;
        const isSelfChat = participantId === user.id;
        const userRooms = await this.roomRepo.findRoomsWithUserId({
          userId: user.id,
        });
        const existingRoom = userRooms.find((room) =>
          isSelfChat
            ? room.isSelfChat()
            : room.isOneOnOne() && room.hasParticipant(participantId),
        );

        if (existingRoom) {
          return {
            success: true,
            message: "Room already exists",
            data: existingRoom.toDTO(),
          };
        }
      }

      // Fetch each side's blocked-id lists so the domain model can decide
      // whether this room is allowed to be created
      const creatorContacts = await this.getUsersContactsService.execute({
        userId: user.id,
      });

      const participantContactsResults = await Promise.all(
        participantIds.map((id) =>
          this.getUsersContactsService.execute({ userId: id }),
        ),
      );

      const participantBlockedIds = new Map(
        participantIds.map((id, index) => [
          id,
          participantContactsResults[index].blocked.map((c) => c.userId),
        ]),
      );

      const canCreateResult = Room.canCreate({
        creatorId: user.id,
        participantIds,
        creatorBlockedIds: creatorContacts.blocked.map((c) => c.userId),
        participantBlockedIds,
      });

      if (!canCreateResult.allowed) {
        const message =
          canCreateResult.reason === "creator_blocked_participant"
            ? "You have blocked one or more participants"
            : "One or more participants have blocked you";

        return { success: false, message, data: null };
      }

      // Resolve every participant's identity (name) before constructing the room -
      // re-verified against the DB here rather than trusted from the caller's DTO,
      // since the DTO only proves the id's provenance, not that the rest of its
      // fields are still current.
      const identities = await this.findUserIdentitiesService.execute({
        userIds: [user.id, ...participantIds],
      });
      const identitiesById = new Map(
        identities.map((identity) => [identity.id, identity]),
      );

      const creatorIdentity = identitiesById.get(user.id);

      if (!creatorIdentity)
        return { success: false, message: "Internal server error", data: null };

      const participantIdentities = participantIds.map((id) =>
        identitiesById.get(id),
      );

      if (participantIdentities.some((identity) => !identity))
        return { success: false, message: "Internal server error", data: null };

      // Create the room - the domain model decides accepted/pending status
      const newRoom = Room.create({
        name,
        creator: creatorIdentity,
        participants: participantIdentities as NonNullable<
          (typeof participantIdentities)[number]
        >[],
      });

      const roomDoc = await this.roomRepo.create(newRoom);

      return {
        success: true,
        message: "Room created successfully",
        data: roomDoc.toDTO(),
      };
    } catch (error) {
      if (error instanceof mongoose.Error) {
        console.error("[Mongoose]", error.message);
        return { success: false, message: "Invalid request data", data: null };
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
