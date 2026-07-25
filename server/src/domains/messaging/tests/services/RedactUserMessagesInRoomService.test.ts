import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createNewRoomService, createMessageService } from "../../../../composition";
import { RedactUserMessagesInRoomService } from "../../services/RedactUserMessagesInRoomService";
import { FindRoomMessagesService } from "../../services/FindRoomMessagesService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { FindUserIdentitiesService } from "../../../authAndAccess/services/FindUserIdentitiesService";
import { MessageRepo } from "../../repo/mongooseMessageRepo";
import { registerAndLogin, cleanupUser } from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const messageRepo = new MessageRepo(new FindUserIdentitiesService(userRepo));
const redactUserMessagesInRoomService = new RedactUserMessagesInRoomService(messageRepo);
const findRoomMessagesService = new FindRoomMessagesService(messageRepo);

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("RedactUserMessagesInRoomService", () => {
  it("redacts only the given user's messages in the room", async () => {
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
      newMessage: { roomId: room.data.id, text: "from a" },
    });
    await createMessageService.execute({
      sender: { id: b.id, firstName: b.firstName, lastName: b.lastName },
      newMessage: { roomId: room.data.id, text: "from b" },
    });

    const redactedCount = await redactUserMessagesInRoomService.execute({
      userId: a.id,
      roomId: room.data.id,
    });
    expect(redactedCount).toBe(1);

    const messages = await findRoomMessagesService.execute({ room: room.data, userId: a.id });
    const fromB = messages.messages.find((m) => !m.redacted && m.sender.userId === b.id);
    const fromA = messages.messages.find((m) => m !== fromB);

    expect(fromA?.redacted).toBe(true);
    expect(fromB?.redacted).toBe(false);

    await cleanupUser(a);
    await cleanupUser(b);
  });

  it("returns 0 when the user has no messages in the room", async () => {
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
      newMessage: { roomId: room.data.id, text: "from a" },
    });

    const redactedCount = await redactUserMessagesInRoomService.execute({
      userId: b.id,
      roomId: room.data.id,
    });
    expect(redactedCount).toBe(0);

    await cleanupUser(a);
    await cleanupUser(b);
  });
});
