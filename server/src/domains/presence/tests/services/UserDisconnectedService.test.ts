import "dotenv/config";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { UserDisconnectedService } from "../../services/UserDisconnectedService";
import { createNewRoomService } from "../../../../composition";
import { AddContactService } from "../../../authAndAccess/services/AddContactService";
import { GetUsersContactsService } from "../../../authAndAccess/services/GetUsersContactsService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { contactsRepo } from "../../../authAndAccess/repo/ContactsRepo";
import {
  registerAndLogin,
  cleanupUser,
  createFakeSocket,
  createFakePresenceRepo,
} from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

let fakeSocket: ReturnType<typeof createFakeSocket>;
let fakePresenceRepo: ReturnType<typeof createFakePresenceRepo>;
let userDisconnectedService: UserDisconnectedService;
let addContactService: AddContactService;

const getUsersContactsService = new GetUsersContactsService(contactsRepo);

beforeEach(() => {
  fakeSocket = createFakeSocket();
  fakePresenceRepo = createFakePresenceRepo();
  userDisconnectedService = new UserDisconnectedService(
    fakePresenceRepo.repo,
    fakeSocket.socket,
    getUsersContactsService,
  );
  // Own fake socket, distinct from fakeSocket above - the composed
  // singleton reaches into socket.ts's module-level `io`, never assigned
  // since this file never calls attachSocket().
  addContactService = new AddContactService(
    userRepo,
    contactsRepo,
    createFakeSocket().socket,
    createNewRoomService,
  );
});

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("UserDisconnectedService", () => {
  it("marks the user offline", async () => {
    const a = await registerAndLogin("A");

    await userDisconnectedService.execute({ userId: a.id, roomIds: [] });

    expect(fakePresenceRepo.calls).toContainEqual({
      method: "setOffline",
      args: { userId: a.id },
    });

    await cleanupUser(a);
  });

  it("notifies every contact that the user went offline", async () => {
    const a = await registerAndLogin("A");
    const b = await registerAndLogin("B");

    await addContactService.execute({ userId: a.id, contactId: b.id });

    await userDisconnectedService.execute({ userId: a.id, roomIds: [] });

    expect(fakeSocket.calls).toContainEqual({
      method: "emitToUser",
      args: { userId: b.id, event: "user:offline", payload: { userId: a.id } },
    });

    await cleanupUser(a);
    await cleanupUser(b);
  });

  it("also broadcasts to every room the socket was in, for non-contact room members", async () => {
    const a = await registerAndLogin("A");

    await userDisconnectedService.execute({
      userId: a.id,
      roomIds: ["room-1", "room-2"],
    });

    expect(fakeSocket.calls).toContainEqual({
      method: "emitToRoom",
      args: { roomId: "room-1", event: "user:offline", payload: { userId: a.id } },
    });
    expect(fakeSocket.calls).toContainEqual({
      method: "emitToRoom",
      args: { roomId: "room-2", event: "user:offline", payload: { userId: a.id } },
    });

    await cleanupUser(a);
  });

  it("does not throw when the user has no Contacts document at all", async () => {
    // Regression test: this crashed the whole server process in practice -
    // GetUsersContactsService throws a RepoError when a Contacts document
    // doesn't exist for the given id (ContactsRepo.findByUserId), and this
    // service previously had no try/catch, so the throw was unhandled inside
    // socket.ts's onConnection handler.
    await expect(
      userDisconnectedService.execute({
        userId: new mongoose.Types.ObjectId().toString(),
        roomIds: [],
      }),
    ).resolves.toBeUndefined();
  });
});
