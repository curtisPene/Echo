// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useStartConversationViewModel } from "../../viewModels/useStartConversationViewModel";
import { roomsControllers } from "@/composition";
import { useAuth } from "@/stores/useAuth";
import { User } from "@/domains/authAndAccess/entities/user";
import type { ContactDTO } from "@/domains/authAndAccess/entities/contacts";
import type { RoomDTO } from "../../entities/room";

const CURRENT_USER = User.hydrate({
  id: "user-1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
});

const CONTACT: ContactDTO = {
  userId: "user-2",
  firstName: "Grace",
  lastName: "Hopper",
  email: "grace@example.com",
};

const EXISTING_ROOM: RoomDTO = {
  id: "room-1",
  name: "Ada, Grace",
  participants: [],
};

beforeEach(() => {
  vi.spyOn(roomsControllers, "selectRoom");
  vi.spyOn(roomsControllers, "createRoom");
  useAuth.setState({
    authStatus: "authenticated",
    user: CURRENT_USER,
    accessToken: "fake-access-token",
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  useAuth.setState({ authStatus: "unverified", user: null });
});

describe("useStartConversationViewModel", () => {
  it("starts not opening, no error", () => {
    const { result } = renderHook(() => useStartConversationViewModel());

    expect(result.current.isOpening).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("selects the existing room directly, without calling createRoom, when the entry already has a room", async () => {
    const { result } = renderHook(() => useStartConversationViewModel());

    let outcome!: Awaited<ReturnType<typeof result.current.open>>;
    await act(async () => {
      outcome = await result.current.open({ room: EXISTING_ROOM, contact: CONTACT });
    });

    expect(roomsControllers.selectRoom).toHaveBeenCalledWith(EXISTING_ROOM);
    expect(roomsControllers.createRoom).not.toHaveBeenCalled();
    expect(outcome.success).toBe(true);
  });

  it("creates a new 1:1 room via the controller when the entry has no room yet", async () => {
    vi.mocked(roomsControllers.createRoom).mockResolvedValue({
      success: true,
      roomId: "room-2",
      name: "Ada, Grace",
    });
    const { result } = renderHook(() => useStartConversationViewModel());

    await act(() => result.current.open({ contact: CONTACT }));

    expect(roomsControllers.createRoom).toHaveBeenCalledWith({
      user: CURRENT_USER,
      contacts: [CONTACT],
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isOpening).toBe(false);
  });

  it("sets the error when createRoom fails", async () => {
    vi.mocked(roomsControllers.createRoom).mockResolvedValue({
      success: false,
      message: "One or more participants could not be found",
    });
    const { result } = renderHook(() => useStartConversationViewModel());

    await act(() => result.current.open({ contact: CONTACT }));

    expect(result.current.error).toBe("One or more participants could not be found");
  });

  it("fails fast with 'Not authenticated' when there is no current user, without calling createRoom", async () => {
    useAuth.setState({ authStatus: "unauthenticated", user: null });
    const { result } = renderHook(() => useStartConversationViewModel());

    let outcome!: Awaited<ReturnType<typeof result.current.open>>;
    await act(async () => {
      outcome = await result.current.open({ contact: CONTACT });
    });

    expect(roomsControllers.createRoom).not.toHaveBeenCalled();
    expect(outcome).toEqual({ success: false, message: "Not authenticated" });
    expect(result.current.error).toBe("Not authenticated");
  });

  it("sets isOpening true while creating a room is in flight", async () => {
    let resolveCreate!: (value: Awaited<ReturnType<typeof roomsControllers.createRoom>>) => void;
    const pending = new Promise<Awaited<ReturnType<typeof roomsControllers.createRoom>>>(
      (resolve) => {
        resolveCreate = resolve;
      },
    );
    vi.mocked(roomsControllers.createRoom).mockReturnValue(pending);
    const { result } = renderHook(() => useStartConversationViewModel());

    let openPromise!: Promise<unknown>;
    act(() => {
      openPromise = result.current.open({ contact: CONTACT });
    });

    expect(result.current.isOpening).toBe(true);

    resolveCreate({ success: true, roomId: "room-2", name: "Ada, Grace" });
    await act(() => openPromise);

    expect(result.current.isOpening).toBe(false);
  });
});
