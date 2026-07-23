// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAppBootstrap } from "../../hooks/useAppBootstrap";
import { authControllers, syncControllers } from "@/composition";
import { connectRealtimeSocket } from "@/app/socket/connectRealtimeSocket";
import type { AppStatus } from "@/stores/useAppStatus";
import type { Auth } from "@/stores/useAuth";
import { User } from "@/domains/authAndAccess/entities/user";

vi.mock("@/app/socket/connectRealtimeSocket", () => ({
  connectRealtimeSocket: vi.fn(() => vi.fn()),
}));

const AUTHENTICATED_USER = User.hydrate({
  id: "user-1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
});

const UNVERIFIED_AUTH: Auth = { authStatus: "unverified", user: null };
const AUTHENTICATED_AUTH: Auth = {
  authStatus: "authenticated",
  user: AUTHENTICATED_USER,
  accessToken: "fake-access-token",
};

function renderBootstrap(props: {
  appStatus: AppStatus;
  auth: Auth;
  onlineStatus?: "online" | "offline";
  setOnlineStatus?: (status: "online" | "offline") => void;
}) {
  return renderHook(
    (p: Parameters<typeof useAppBootstrap>[0]) => useAppBootstrap(p),
    {
      initialProps: {
        appStatus: props.appStatus,
        auth: props.auth,
        onlineStatus: props.onlineStatus ?? "offline",
        setOnlineStatus: props.setOnlineStatus ?? vi.fn(),
      },
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(authControllers, "verify").mockResolvedValue(undefined as never);
  vi.spyOn(syncControllers, "sync").mockResolvedValue(undefined as never);
});

describe("useAppBootstrap", () => {
  it("calls authControllers.verify when idle and unverified", () => {
    renderBootstrap({ appStatus: "idle", auth: UNVERIFIED_AUTH });

    expect(authControllers.verify).toHaveBeenCalledTimes(1);
    expect(syncControllers.sync).not.toHaveBeenCalled();
    expect(connectRealtimeSocket).not.toHaveBeenCalled();
  });

  it("does not call verify when idle but already authenticated", () => {
    renderBootstrap({ appStatus: "idle", auth: AUTHENTICATED_AUTH });

    expect(authControllers.verify).not.toHaveBeenCalled();
  });

  it("does not call verify when not idle, even if unverified", () => {
    renderBootstrap({ appStatus: "syncing", auth: UNVERIFIED_AUTH });

    expect(authControllers.verify).not.toHaveBeenCalled();
  });

  it("calls syncControllers.sync when syncing and authenticated", () => {
    renderBootstrap({ appStatus: "syncing", auth: AUTHENTICATED_AUTH });

    expect(syncControllers.sync).toHaveBeenCalledTimes(1);
    expect(syncControllers.sync).toHaveBeenCalledWith({
      auth: AUTHENTICATED_AUTH,
    });
    expect(authControllers.verify).not.toHaveBeenCalled();
    expect(connectRealtimeSocket).not.toHaveBeenCalled();
  });

  it("does not call sync when syncing but not authenticated", () => {
    renderBootstrap({ appStatus: "syncing", auth: UNVERIFIED_AUTH });

    expect(syncControllers.sync).not.toHaveBeenCalled();
  });

  it("connects the realtime socket when synced and authenticated", () => {
    renderBootstrap({ appStatus: "synced", auth: AUTHENTICATED_AUTH });

    expect(connectRealtimeSocket).toHaveBeenCalledTimes(1);
    expect(connectRealtimeSocket).toHaveBeenCalledWith(
      expect.objectContaining({ auth: AUTHENTICATED_AUTH }),
    );
    expect(authControllers.verify).not.toHaveBeenCalled();
    expect(syncControllers.sync).not.toHaveBeenCalled();
  });

  it("does not connect the socket when synced but not authenticated", () => {
    renderBootstrap({ appStatus: "synced", auth: UNVERIFIED_AUTH });

    expect(connectRealtimeSocket).not.toHaveBeenCalled();
  });

  it("runs the socket cleanup function on unmount", () => {
    const cleanup = vi.fn();
    vi.mocked(connectRealtimeSocket).mockReturnValue(cleanup);

    const { unmount } = renderBootstrap({
      appStatus: "synced",
      auth: AUTHENTICATED_AUTH,
    });

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("re-runs verify -> sync -> connect as appStatus advances across rerenders", () => {
    const { rerender } = renderBootstrap({
      appStatus: "idle",
      auth: UNVERIFIED_AUTH,
    });
    expect(authControllers.verify).toHaveBeenCalledTimes(1);

    rerender({
      appStatus: "syncing",
      auth: AUTHENTICATED_AUTH,
      onlineStatus: "offline",
      setOnlineStatus: vi.fn(),
    });
    expect(syncControllers.sync).toHaveBeenCalledTimes(1);

    rerender({
      appStatus: "synced",
      auth: AUTHENTICATED_AUTH,
      onlineStatus: "offline",
      setOnlineStatus: vi.fn(),
    });
    expect(connectRealtimeSocket).toHaveBeenCalledTimes(1);
  });
});
