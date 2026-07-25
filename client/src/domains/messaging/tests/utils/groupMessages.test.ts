import { describe, expect, it } from "vitest";
import { groupMessages, type MessageCluster } from "../../utils/groupMessages";
import type { MessageDTO } from "../../entities/message";

const SENDER_A = { userId: "user-a", firstName: "Ada", lastName: "Lovelace" };
const SENDER_B = { userId: "user-b", firstName: "Grace", lastName: "Hopper" };

function message(
  overrides: Partial<Extract<MessageDTO, { redacted: false }>> & {
    id: string;
    createdAt: string;
  },
): MessageDTO {
  return {
    roomId: "room-1",
    redacted: false,
    sender: SENDER_A,
    text: "hi",
    reactions: [],
    readBy: [],
    deliveredTo: [],
    deliveryStatus: "sent",
    ...overrides,
  };
}

function redactedMessage(id: string, createdAt: string): MessageDTO {
  return {
    id,
    roomId: "room-1",
    redacted: true,
    sender: null,
    text: null,
    createdAt,
    reactions: null,
    readBy: null,
    deliveredTo: [],
    deliveryStatus: "sent",
  };
}

function clusters(entries: ReturnType<typeof groupMessages>): MessageCluster[] {
  return entries.filter((entry): entry is MessageCluster => entry.kind === "cluster");
}

function dividerLabels(entries: ReturnType<typeof groupMessages>): string[] {
  return entries
    .filter((entry) => entry.kind === "divider")
    .map((entry) => entry.label);
}

describe("groupMessages - clustering", () => {
  it("joins consecutive same-sender messages sent in the same minute into one cluster", () => {
    const messages = [
      message({ id: "1", sender: SENDER_A, createdAt: "2026-07-25T10:00:05.000Z" }),
      message({ id: "2", sender: SENDER_A, createdAt: "2026-07-25T10:00:40.000Z" }),
    ];

    const result = clusters(groupMessages(messages));

    expect(result).toHaveLength(1);
    expect(result[0].messages.map((m) => m.id)).toEqual(["1", "2"]);
  });

  it("splits same-sender messages into separate clusters when they land in different minutes", () => {
    const messages = [
      message({ id: "1", sender: SENDER_A, createdAt: "2026-07-25T10:00:05.000Z" }),
      message({ id: "2", sender: SENDER_A, createdAt: "2026-07-25T10:02:05.000Z" }),
    ];

    const result = clusters(groupMessages(messages));

    expect(result).toHaveLength(2);
    expect(result[0].messages.map((m) => m.id)).toEqual(["1"]);
    expect(result[1].messages.map((m) => m.id)).toEqual(["2"]);
  });

  it("splits into a new cluster when the sender changes, even within the same minute", () => {
    const messages = [
      message({ id: "1", sender: SENDER_A, createdAt: "2026-07-25T10:00:05.000Z" }),
      message({ id: "2", sender: SENDER_B, createdAt: "2026-07-25T10:00:10.000Z" }),
    ];

    const result = clusters(groupMessages(messages));

    expect(result).toHaveLength(2);
    expect(result[0].senderId).toBe(SENDER_A.userId);
    expect(result[1].senderId).toBe(SENDER_B.userId);
  });

  it("always gives a redacted message its own singleton cluster", () => {
    const messages = [
      message({ id: "1", sender: SENDER_A, createdAt: "2026-07-25T10:00:05.000Z" }),
      redactedMessage("2", "2026-07-25T10:00:10.000Z"),
      message({ id: "3", sender: SENDER_A, createdAt: "2026-07-25T10:00:15.000Z" }),
    ];

    const result = clusters(groupMessages(messages));

    expect(result).toHaveLength(3);
    expect(result[0].messages.map((m) => m.id)).toEqual(["1"]);
    expect(result[1].messages.map((m) => m.id)).toEqual(["2"]);
    expect(result[1].senderId).toBeNull();
    expect(result[2].messages.map((m) => m.id)).toEqual(["3"]);
  });

  it("sorts messages chronologically before grouping regardless of input order", () => {
    const messages = [
      message({ id: "2", createdAt: "2026-07-25T10:00:30.000Z" }),
      message({ id: "1", createdAt: "2026-07-25T10:00:00.000Z" }),
    ];

    const result = clusters(groupMessages(messages));

    expect(result[0].messages.map((m) => m.id)).toEqual(["1", "2"]);
  });
});

describe("groupMessages - dividers", () => {
  it("gives two messages sent in the same minute today one shared divider", () => {
    const messages = [
      message({ id: "1", createdAt: "2026-07-25T10:00:05.000Z" }),
      message({ id: "2", createdAt: "2026-07-25T10:00:40.000Z" }),
    ];

    const entries = groupMessages(messages);

    expect(dividerLabels(entries)).toHaveLength(1);
  });

  it("gives messages sent in different minutes today two separate dividers, one per minute", () => {
    const messages = [
      message({ id: "1", createdAt: "2026-07-25T10:00:05.000Z" }),
      message({ id: "2", createdAt: "2026-07-25T10:01:05.000Z" }),
    ];

    const entries = groupMessages(messages);
    const labels = dividerLabels(entries);

    expect(labels).toHaveLength(2);
    expect(labels[0]).not.toBe(labels[1]);
  });

  it("dividers are shared across senders - a sender change alone doesn't start a new divider", () => {
    const messages = [
      message({ id: "1", sender: SENDER_A, createdAt: "2026-07-25T10:00:05.000Z" }),
      message({ id: "2", sender: SENDER_B, createdAt: "2026-07-25T10:00:10.000Z" }),
    ];

    const entries = groupMessages(messages);

    expect(dividerLabels(entries)).toHaveLength(1);
  });

  it("labels yesterday's messages with a single 'Yesterday' divider regardless of time of day", () => {
    const now = new Date();
    const yesterdayMorning = new Date(now);
    yesterdayMorning.setDate(now.getDate() - 1);
    yesterdayMorning.setHours(8, 0, 0, 0);
    const yesterdayEvening = new Date(now);
    yesterdayEvening.setDate(now.getDate() - 1);
    yesterdayEvening.setHours(20, 0, 0, 0);

    const messages = [
      message({ id: "1", createdAt: yesterdayMorning.toISOString() }),
      message({ id: "2", createdAt: yesterdayEvening.toISOString() }),
    ];

    const entries = groupMessages(messages);
    const labels = dividerLabels(entries);

    expect(labels).toEqual(["Yesterday"]);
  });

  it("labels a message from earlier this week with just the weekday name", () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const messages = [message({ id: "1", createdAt: threeDaysAgo.toISOString() })];

    const entries = groupMessages(messages);
    const labels = dividerLabels(entries);

    expect(labels).toEqual([
      threeDaysAgo.toLocaleDateString([], { weekday: "long" }),
    ]);
  });

  it("labels a message from more than a week ago with weekday, day, and month", () => {
    const old = new Date();
    old.setDate(old.getDate() - 10);

    const messages = [message({ id: "1", createdAt: old.toISOString() })];

    const entries = groupMessages(messages);
    const labels = dividerLabels(entries);

    expect(labels[0]).toContain(old.toLocaleDateString([], { weekday: "long" }));
    expect(labels[0]).toContain(old.toLocaleDateString([], { month: "short" }));
    expect(labels[0]).not.toContain(String(old.getFullYear()));
  });

  it("includes the year for a message from a prior year", () => {
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    const messages = [message({ id: "1", createdAt: lastYear.toISOString() })];

    const entries = groupMessages(messages);
    const labels = dividerLabels(entries);

    expect(labels[0]).toContain(String(lastYear.getFullYear()));
  });
});
