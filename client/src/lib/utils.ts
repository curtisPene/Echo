import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()
}

export function formatTimestamp(isoDate: string | null) {
  if (!isoDate) return "";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d`;
}

export function formatMessageTime(isoDate: string) {
  return new Date(isoDate).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
