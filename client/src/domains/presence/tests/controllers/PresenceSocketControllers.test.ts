import { describe, expect, it, beforeEach } from "vitest";
import { PresenceSocketControllers } from "../../controllers/PresenceSocketControllers";
import { usePresence } from "../../stores/usePresence";

let controllers: PresenceSocketControllers;

beforeEach(() => {
  controllers = new PresenceSocketControllers();
  usePresence.setState({ onlineUserIds: {} });
});

describe("PresenceSocketControllers", () => {
  it("marks a user online on user:online", () => {
    controllers.onUserOnline({ userId: "user-1" });

    expect(usePresence.getState().onlineUserIds["user-1"]).toBe(true);
  });

  it("marks a user offline on user:offline", () => {
    usePresence.setState({ onlineUserIds: { "user-1": true } });

    controllers.onUserOffline({ userId: "user-1" });

    expect(usePresence.getState().onlineUserIds["user-1"]).toBe(false);
  });

  it("ignores a malformed user:online payload instead of throwing", () => {
    expect(() => controllers.onUserOnline({ notUserId: 123 })).not.toThrow();
    expect(usePresence.getState().onlineUserIds).toEqual({});
  });

  it("ignores a malformed user:offline payload instead of throwing", () => {
    expect(() => controllers.onUserOffline({ notUserId: 123 })).not.toThrow();
    expect(usePresence.getState().onlineUserIds).toEqual({});
  });

  it("does not affect other users' online state", () => {
    usePresence.setState({ onlineUserIds: { "user-1": true, "user-2": true } });

    controllers.onUserOffline({ userId: "user-1" });

    expect(usePresence.getState().onlineUserIds["user-1"]).toBe(false);
    expect(usePresence.getState().onlineUserIds["user-2"]).toBe(true);
  });
});
