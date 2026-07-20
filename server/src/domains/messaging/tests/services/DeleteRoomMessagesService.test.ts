import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createNewRoomService, createMessageService } from "../../../../composition";
import { DeleteRoomMessagesService } from "../../services/DeleteRoomMessagesService";
import { FindRoomMessagesService } from "../../services/FindRoomMessagesService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { FindUserIdentitiesService } from "../../../authAndAccess/services/FindUserIdentitiesService";
import { MessageRepo } from "../../repo/mongooseMessageRepo";
import { registerAndLogin, cleanupUser } from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const messageRepo = new MessageRepo(new FindUserIdentitiesService(userRepo));
const deleteRoomMessagesService = new DeleteRoomMessagesService(messageRepo);
const findRoomMessagesService = new FindRoomMessagesService(messageRepo);

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("DeleteRoomMessagesService", () => {
  it("deletes every message in a room and returns the count", async () => {
    const a = await registerAndLogin("A");
    const b = await registerAndLogin("B");

    const room = await createNewRoomService.execute({
      user: a,
      participants: [{ id: b.id }],
      name: "A, B",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    await createMessageService.execute({
      sender: { id: a.id, firstName: a.firstName, lastName: a.lastName },
      newMessage: { roomId: room.data.id, text: "one" },
    });
    await createMessageService.execute({
      sender: { id: b.id, firstName: b.firstName, lastName: b.lastName },
      newMessage: { roomId: room.data.id, text: "two" },
    });

    const deletedCount = await deleteRoomMessagesService.execute({ roomId: room.data.id });
    expect(deletedCount).toBe(2);

    const remaining = await findRoomMessagesService.execute({ roomId: room.data.id, userId: a.id });
    expect(remaining.messages).toEqual([]);

    await cleanupUser(a);
    await cleanupUser(b);
  });

  it("returns 0 for a room with no messages", async () => {
    const a = await registerAndLogin("A");
    const b = await registerAndLogin("B");

    const room = await createNewRoomService.execute({
      user: a,
      participants: [{ id: b.id }],
      name: "A, B",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const deletedCount = await deleteRoomMessagesService.execute({ roomId: room.data.id });
    expect(deletedCount).toBe(0);

    await cleanupUser(a);
    await cleanupUser(b);
  });
});
