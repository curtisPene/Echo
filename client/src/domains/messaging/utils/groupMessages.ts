import type { MessageDTO } from "../entities/message";

export type MessageDivider = { kind: "divider"; label: string };
export type MessageCluster = {
  kind: "cluster";
  senderId: string | null;
  messages: MessageDTO[];
};
export type MessageListEntry = MessageDivider | MessageCluster;

function isSameDay(a: string, b: string): boolean {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function isSameMinute(a: string, b: string): boolean {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    isSameDay(a, b) &&
    dateA.getHours() === dateB.getHours() &&
    dateA.getMinutes() === dateB.getMinutes()
  );
}

/**
 * Dividers mark WHEN a message was sent, never who sent it - everyone's
 * messages share the same dividers. The key is what decides whether two
 * messages fall under the same divider (never re-shown back to back); the
 * label is only what gets displayed. They can differ - e.g. two different
 * minutes today both render as clock times but must still be distinct
 * dividers, so the key includes the actual minute, not just the label text.
 */
function dividerKeyAndLabel(
  isoDate: string,
  now: Date,
): { key: string; label: string } {
  const date = new Date(isoDate);

  if (isSameDay(isoDate, now.toISOString())) {
    const minuteKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
    const label = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    return { key: `minute:${minuteKey}`, label };
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(isoDate, yesterday.toISOString())) {
    return { key: "day:yesterday", label: "Yesterday" };
  }

  const diffDays = (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000);
  if (diffDays < 7) {
    const label = date.toLocaleDateString([], { weekday: "long" });
    return { key: `weekday:${label}`, label };
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  const label = date.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  });
  return {
    key: `date:${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    label,
  };
}

/**
 * Turns a chronological message list into a render-ready sequence of time
 * dividers and sender clusters - the one place that decides "does this
 * message start a new time bucket/new cluster", so MessageListItem and
 * ConversationScreen never need to inspect neighbors themselves.
 *
 * Dividers are purely time-based (shared across every sender): messages
 * from today divide by the minute, yesterday's messages share one
 * "Yesterday" divider, messages from earlier this week divide by weekday
 * name, older messages this year divide by weekday+day+month, and messages
 * from a prior year also include the year.
 *
 * Clustering (grouping consecutive bubbles under one avatar/name) is a
 * separate, orthogonal concern: a message only joins the current cluster
 * if it's from the same sender AND sent in the same minute as the previous
 * message in that cluster - same sender hours apart still starts a fresh
 * cluster. Redacted messages (sender: null) always get their own singleton
 * cluster, since there's no real sender identity to group them under.
 */
export function groupMessages(messages: MessageDTO[]): MessageListEntry[] {
  const now = new Date();
  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const entries: MessageListEntry[] = [];
  let currentCluster: MessageCluster | null = null;
  let lastDividerKey: string | null = null;

  for (const message of sorted) {
    const { key, label } = dividerKeyAndLabel(message.createdAt, now);
    if (key !== lastDividerKey) {
      entries.push({ kind: "divider", label });
      lastDividerKey = key;
      currentCluster = null;
    }

    const senderId = message.sender?.userId ?? null;
    const previousMessage =
      currentCluster?.messages[currentCluster.messages.length - 1];
    const canJoinCurrentCluster =
      currentCluster !== null &&
      senderId !== null &&
      currentCluster.senderId === senderId &&
      !!previousMessage &&
      isSameMinute(previousMessage.createdAt, message.createdAt);

    if (canJoinCurrentCluster && currentCluster) {
      currentCluster.messages.push(message);
    } else {
      currentCluster = { kind: "cluster", senderId, messages: [message] };
      entries.push(currentCluster);
    }
  }

  return entries;
}
