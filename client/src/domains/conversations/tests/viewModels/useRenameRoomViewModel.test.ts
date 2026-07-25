// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRenameRoomViewModel } from "../../viewModels/useRenameRoomViewModel";
import { roomsControllers } from "@/composition";

beforeEach(() => {
  vi.spyOn(roomsControllers, "renameRoom");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useRenameRoomViewModel", () => {
  it("starts not renaming, no error", () => {
    const { result } = renderHook(() => useRenameRoomViewModel());

    expect(result.current.isRenaming).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("renameRoom calls the controller with the room id and new name", async () => {
    vi.mocked(roomsControllers.renameRoom).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useRenameRoomViewModel());

    await act(() => result.current.renameRoom("room-1", "New Name"));

    expect(roomsControllers.renameRoom).toHaveBeenCalledWith({
      roomId: "room-1",
      name: "New Name",
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isRenaming).toBe(false);
  });

  it("sets the error on failure", async () => {
    vi.mocked(roomsControllers.renameRoom).mockResolvedValue({
      success: false,
      message: "Not a participant of this room",
    });
    const { result } = renderHook(() => useRenameRoomViewModel());

    await act(() => result.current.renameRoom("room-1", "New Name"));

    expect(result.current.error).toBe("Not a participant of this room");
  });

  it("sets isRenaming true while the request is in flight", async () => {
    let resolveRename!: (value: Awaited<ReturnType<typeof roomsControllers.renameRoom>>) => void;
    const pending = new Promise<Awaited<ReturnType<typeof roomsControllers.renameRoom>>>(
      (resolve) => {
        resolveRename = resolve;
      },
    );
    vi.mocked(roomsControllers.renameRoom).mockReturnValue(pending);
    const { result } = renderHook(() => useRenameRoomViewModel());

    let renamePromise!: Promise<unknown>;
    act(() => {
      renamePromise = result.current.renameRoom("room-1", "New Name");
    });

    expect(result.current.isRenaming).toBe(true);

    resolveRename({ success: true });
    await act(() => renamePromise);

    expect(result.current.isRenaming).toBe(false);
  });
});
