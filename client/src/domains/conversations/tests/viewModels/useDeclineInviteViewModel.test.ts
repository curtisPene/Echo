// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDeclineInviteViewModel } from "../../viewModels/useDeclineInviteViewModel";
import { roomsControllers } from "@/composition";

beforeEach(() => {
  vi.spyOn(roomsControllers, "acceptRequest");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useDeclineInviteViewModel", () => {
  it("starts not declining, no error", () => {
    const { result } = renderHook(() => useDeclineInviteViewModel());

    expect(result.current.isDeclining).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("declineInvite calls the controller with the room id and isAcceptRequest: false", async () => {
    vi.mocked(roomsControllers.acceptRequest).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useDeclineInviteViewModel());

    await act(() => result.current.declineInvite("room-1"));

    expect(roomsControllers.acceptRequest).toHaveBeenCalledWith({
      roomId: "room-1",
      isAcceptRequest: false,
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isDeclining).toBe(false);
  });

  it("sets the error on failure", async () => {
    vi.mocked(roomsControllers.acceptRequest).mockResolvedValue({
      success: false,
      message: "Room not found",
    });
    const { result } = renderHook(() => useDeclineInviteViewModel());

    await act(() => result.current.declineInvite("room-1"));

    expect(result.current.error).toBe("Room not found");
  });

  it("sets isDeclining true while the request is in flight", async () => {
    let resolveDecline!: (value: Awaited<ReturnType<typeof roomsControllers.acceptRequest>>) => void;
    const pending = new Promise<Awaited<ReturnType<typeof roomsControllers.acceptRequest>>>(
      (resolve) => {
        resolveDecline = resolve;
      },
    );
    vi.mocked(roomsControllers.acceptRequest).mockReturnValue(pending);
    const { result } = renderHook(() => useDeclineInviteViewModel());

    let declinePromise!: Promise<unknown>;
    act(() => {
      declinePromise = result.current.declineInvite("room-1");
    });

    expect(result.current.isDeclining).toBe(true);

    resolveDecline({ success: true });
    await act(() => declinePromise);

    expect(result.current.isDeclining).toBe(false);
  });
});
