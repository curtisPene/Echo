import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { createNewRoomService, createMessageService } from "../../../../composition";
import { FindRoomMessagesService } from "../../services/FindRoomMessagesService";
import { userRepo } from "../../../authAndAccess/repo/UserRepo";
import { FindUserIdentitiesService } from "../../../authAndAccess/services/FindUserIdentitiesService";
import { MessageRepo } from "../../repo/mongooseMessageRepo";
import { registerAndLogin, cleanupUser } from "../../../authAndAccess/tests/testHelpers";
import { mongooseConnect } from "../../../../server";
import mongoose from "mongoose";

const messageRepo = new MessageRepo(new FindUserIdentitiesService(userRepo));
const findRoomMessagesService = new FindRoomMessagesService(messageRepo);

beforeAll(async () => {
  await mongooseConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("FindRoomMessagesService", () => {
  it("returns every message in a room, most recent first", async () => {
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
      newMessage: { roomId: room.data.id, text: "first" },
    });
    await createMessageService.execute({
      sender: { id: b.id, firstName: b.firstName, lastName: b.lastName },
      newMessage: { roomId: room.data.id, text: "second" },
    });

    const result = await findRoomMessagesService.execute({ room: room.data, userId: a.id });

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].text).toBe("second");
    expect(result.messages[1].text).toBe("first");

    await cleanupUser(a);
    await cleanupUser(b);
  });

  it("returns an empty array for a room with no messages", async () => {
    const a = await registerAndLogin("A");
    const b = await registerAndLogin("B");

    const room = await createNewRoomService.execute({
      user: a,
      participants: [{ id: b.id }],
      name: "A, B",
    });
    expect(room.success).toBe(true);
    if (!room.success || !room.data) throw new Error("unreachable");

    const result = await findRoomMessagesService.execute({ room: room.data, userId: a.id });

    expect(result.messages).toEqual([]);
    expect(result.unread).toBe(0);

    await cleanupUser(a);
    await cleanupUser(b);
  });

  it("counts messages the user hasn't read yet", async () => {
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
      newMessage: { roomId: room.data.id, text: "unread for b" },
    });

    const result = await findRoomMessagesService.execute({ room: room.data, userId: b.id });

    expect(result.unread).toBe(1);

    await cleanupUser(a);
    await cleanupUser(b);
  });
});
