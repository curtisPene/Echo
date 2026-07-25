import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { searchUserService, createNewRoomService } from "../../../../composition";
import { BlockContactService } from "../../services/BlockContactService";
import { AddContactService } from "../../services/AddContactService";
import { userRepo } from "../../repo/UserRepo";
import { contactsRepo } from "../../repo/ContactsRepo";
import { FindUserIdentitiesService } from "../../services/FindUserIdentitiesService";
import { RoomRepo } from "../../../conversations/repo/mongooseRoomRepo";
import { MessageRepo } from "../../../messaging/repo/mongooseMessageRepo";
import { FindRoomsForUserService } from "../../../conversations/services/FindRoomsForUserService";
import { RemoveParticipantFromRoomService } from "../../../conversations/services/RemoveParticipantFromRoomService";
import { DeleteRoomService } from "../../../conversations/services/DeleteRoomService";
import { DeleteRoomMessagesService } from "../../../messaging/services/DeleteRoomMessagesService";
import { RedactUserMessagesInRoomService } from "../../../messaging/services/RedactUserMessagesInRoomService";
import { registerAndLogin, createFakeSocket, cleanupUser } from "../testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const roomRepo = new RoomRepo(new FindUserIdentitiesService(userRepo));
const messageRepo = new MessageRepo(new FindUserIdentitiesService(userRepo));

// blockContactService and addContactService are only used here as setup (to
// establish a blocked/contact relationship) - not the subject under test -
// but they still need a socket that won't throw, so they're constructed
// locally with a fake one rather than using the real composed instances
// from composition.ts.
const blockContactService = new BlockContactService(
  userRepo,
  contactsRepo,
  createFakeSocket().socket,
  new FindRoomsForUserService(roomRepo),
  new RemoveParticipantFromRoomService(roomRepo),
  new DeleteRoomService(roomRepo),
  new DeleteRoomMessagesService(messageRepo),
  new RedactUserMessagesInRoomService(messageRepo),
);

const addContactService = new AddContactService(
  userRepo,
  contactsRepo,
  createFakeSocket().socket,
  createNewRoomService,
);

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("SearchUserService", () => {
  it("finds a real user by email", async () => {
    const searcher = await registerAndLogin("Searcher");
    const target = await registerAndLogin("Target");

    const result = await searchUserService.execute({
      email: target.email,
      viewerId: searcher.id,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");

    expect(result.data.user.id).toBe(target.id);
    expect(result.data.user.email).toBe(target.email);

    await cleanupUser(searcher);
    await cleanupUser(target);
  });

  it("fails with 'User not found' for an unregistered email", async () => {
    const searcher = await registerAndLogin("Searcher");

    const result = await searchUserService.execute({
      email: "no-such-user@example.com",
      viewerId: searcher.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("User not found");

    await cleanupUser(searcher);
  });

  it("fails with 'User blocked' when the found user has blocked the viewer", async () => {
    const searcher = await registerAndLogin("Searcher");
    const target = await registerAndLogin("Target");

    const blockResult = await blockContactService.execute({
      user: target.id,
      blockedUser: searcher.id,
    });
    expect(blockResult.success).toBe(true);

    const result = await searchUserService.execute({
      email: target.email,
      viewerId: searcher.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("User blocked");

    await cleanupUser(searcher);
    await cleanupUser(target);
  });

  it("fails with 'User not found' when the viewer has blocked the found user", async () => {
    const searcher = await registerAndLogin("Searcher");
    const target = await registerAndLogin("Target");

    const blockResult = await blockContactService.execute({
      user: searcher.id,
      blockedUser: target.id,
    });
    expect(blockResult.success).toBe(true);

    const result = await searchUserService.execute({
      email: target.email,
      viewerId: searcher.id,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("User not found");

    await cleanupUser(searcher);
    await cleanupUser(target);
  });

  it("still finds a user who is already a contact - that check belongs to the caller (AddContactService), not this shared search", async () => {
    const searcher = await registerAndLogin("Searcher");
    const target = await registerAndLogin("Target");

    const addResult = await addContactService.execute({
      userId: searcher.id,
      contactId: target.id,
    });
    expect(addResult.success).toBe(true);

    const result = await searchUserService.execute({
      email: target.email,
      viewerId: searcher.id,
    });

    expect(result.success).toBe(true);
    if (!result.success || !result.data) throw new Error("unreachable");
    expect(result.data.user.id).toBe(target.id);

    await cleanupUser(searcher);
    await cleanupUser(target);
  });
});
