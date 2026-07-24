// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAcceptInviteViewModel } from "../../viewModels/useAcceptInviteViewModel";
import { roomsControllers } from "@/composition";

beforeEach(() => {
  vi.spyOn(roomsControllers, "acceptRequest");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useAcceptInviteViewModel", () => {
  it("starts not accepting, no error", () => {
    const { result } = renderHook(() => useAcceptInviteViewModel());

    expect(result.current.isAccepting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("acceptInvite calls the controller with the room id and isAcceptRequest: true", async () => {
    vi.mocked(roomsControllers.acceptRequest).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useAcceptInviteViewModel());

    await act(() => result.current.acceptInvite("room-1"));

    expect(roomsControllers.acceptRequest).toHaveBeenCalledWith({
      roomId: "room-1",
      isAcceptRequest: true,
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isAccepting).toBe(false);
  });

  it("sets the error on failure", async () => {
    vi.mocked(roomsControllers.acceptRequest).mockResolvedValue({
      success: false,
      message: "Room not found",
    });
    const { result } = renderHook(() => useAcceptInviteViewModel());

    await act(() => result.current.acceptInvite("room-1"));

    expect(result.current.error).toBe("Room not found");
  });

  it("sets isAccepting true while the request is in flight", async () => {
    let resolveAccept!: (value: Awaited<ReturnType<typeof roomsControllers.acceptRequest>>) => void;
    const pending = new Promise<Awaited<ReturnType<typeof roomsControllers.acceptRequest>>>(
      (resolve) => {
        resolveAccept = resolve;
      },
    );
    vi.mocked(roomsControllers.acceptRequest).mockReturnValue(pending);
    const { result } = renderHook(() => useAcceptInviteViewModel());

    let acceptPromise!: Promise<unknown>;
    act(() => {
      acceptPromise = result.current.acceptInvite("room-1");
    });

    expect(result.current.isAccepting).toBe(true);

    resolveAccept({ success: true });
    await act(() => acceptPromise);

    expect(result.current.isAccepting).toBe(false);
  });
});
