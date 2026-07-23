import "dotenv/config";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { UserConnectedService } from "../../services/UserConnectedService";
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
let userConnectedService: UserConnectedService;
let addContactService: AddContactService;

const getUsersContactsService = new GetUsersContactsService(contactsRepo);

beforeEach(() => {
  fakeSocket = createFakeSocket();
  fakePresenceRepo = createFakePresenceRepo();
  userConnectedService = new UserConnectedService(
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

describe("UserConnectedService", () => {
  it("marks the user online", async () => {
    const a = await registerAndLogin("A");

    await userConnectedService.execute({ userId: a.id });

    expect(fakePresenceRepo.calls).toContainEqual({
      method: "setOnline",
      args: { userId: a.id },
    });

    await cleanupUser(a);
  });

  it("notifies every contact that the user came online", async () => {
    const a = await registerAndLogin("A");
    const b = await registerAndLogin("B");
    const c = await registerAndLogin("C");

    await addContactService.execute({ userId: a.id, contactId: b.id });
    await addContactService.execute({ userId: a.id, contactId: c.id });

    await userConnectedService.execute({ userId: a.id });

    const onlineEmits = fakeSocket.calls.filter(
      (call) => call.method === "emitToUser",
    );

    expect(onlineEmits).toContainEqual({
      method: "emitToUser",
      args: { userId: b.id, event: "user:online", payload: { userId: a.id } },
    });
    expect(onlineEmits).toContainEqual({
      method: "emitToUser",
      args: { userId: c.id, event: "user:online", payload: { userId: a.id } },
    });

    await cleanupUser(a);
    await cleanupUser(b);
    await cleanupUser(c);
  });

  it("notifies no one when the user has no contacts", async () => {
    const a = await registerAndLogin("A");

    await userConnectedService.execute({ userId: a.id });

    const onlineEmits = fakeSocket.calls.filter(
      (call) => call.method === "emitToUser",
    );
    expect(onlineEmits).toEqual([]);

    await cleanupUser(a);
  });

  it("does not throw when the user has no Contacts document at all", async () => {
    // Regression test: this crashed the whole server process in practice -
    // GetUsersContactsService throws a RepoError when a Contacts document
    // doesn't exist for the given id (ContactsRepo.findByUserId), and this
    // service previously had no try/catch, so the throw was unhandled inside
    // socket.ts's onConnection handler.
    await expect(
      userConnectedService.execute({ userId: new mongoose.Types.ObjectId().toString() }),
    ).resolves.toBeUndefined();
  });
});
