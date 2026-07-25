// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAddParticipantViewModel } from "../../viewModels/useAddParticipantViewModel";
import { roomsControllers } from "@/composition";

beforeEach(() => {
  vi.spyOn(roomsControllers, "addParticipant");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useAddParticipantViewModel", () => {
  it("starts not adding, no error", () => {
    const { result } = renderHook(() => useAddParticipantViewModel());

    expect(result.current.isAdding).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("addParticipant calls the controller with the room id and participant id", async () => {
    vi.mocked(roomsControllers.addParticipant).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useAddParticipantViewModel());

    await act(() => result.current.addParticipant("room-1", "user-3"));

    expect(roomsControllers.addParticipant).toHaveBeenCalledWith({
      roomId: "room-1",
      participantId: "user-3",
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isAdding).toBe(false);
  });

  it("sets the error on failure", async () => {
    vi.mocked(roomsControllers.addParticipant).mockResolvedValue({
      success: false,
      message: "This user has blocked someone already in this conversation",
    });
    const { result } = renderHook(() => useAddParticipantViewModel());

    await act(() => result.current.addParticipant("room-1", "user-3"));

    expect(result.current.error).toBe(
      "This user has blocked someone already in this conversation",
    );
  });

  it("sets isAdding true while the request is in flight", async () => {
    let resolveAdd!: (value: Awaited<ReturnType<typeof roomsControllers.addParticipant>>) => void;
    const pending = new Promise<Awaited<ReturnType<typeof roomsControllers.addParticipant>>>(
      (resolve) => {
        resolveAdd = resolve;
      },
    );
    vi.mocked(roomsControllers.addParticipant).mockReturnValue(pending);
    const { result } = renderHook(() => useAddParticipantViewModel());

    let addPromise!: Promise<unknown>;
    act(() => {
      addPromise = result.current.addParticipant("room-1", "user-3");
    });

    expect(result.current.isAdding).toBe(true);

    resolveAdd({ success: true });
    await act(() => addPromise);

    expect(result.current.isAdding).toBe(false);
  });
});
