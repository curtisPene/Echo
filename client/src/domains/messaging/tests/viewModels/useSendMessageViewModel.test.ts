// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSendMessageViewModel } from "../../viewModels/useSendMessageViewModel";
import { messagingControllers } from "@/composition";
import { useActiveRoom } from "@/stores/useActiveRoom";
import type { RoomDTO } from "@/domains/conversations/entities/room";

const ACTIVE_ROOM: RoomDTO = {
  id: "room-1",
  name: "Ada, Grace",
  participants: [],
};

beforeEach(() => {
  vi.spyOn(messagingControllers, "sendMessage");
  useActiveRoom.setState({ activeRoom: ACTIVE_ROOM });
});

afterEach(() => {
  vi.restoreAllMocks();
  useActiveRoom.setState({ activeRoom: null });
});

describe("useSendMessageViewModel", () => {
  it("starts with empty text, no error, not sending", () => {
    const { result } = renderHook(() => useSendMessageViewModel());

    expect(result.current.text).toBe("");
    expect(result.current.error).toBeNull();
    expect(result.current.isSending).toBe(false);
  });

  it("updates text via setText without triggering a send", () => {
    const { result } = renderHook(() => useSendMessageViewModel());

    act(() => result.current.setText("hello"));

    expect(result.current.text).toBe("hello");
    expect(messagingControllers.sendMessage).not.toHaveBeenCalled();
  });

  it("sendMessage calls the controller with the text and active room id, then clears text on success", async () => {
    vi.mocked(messagingControllers.sendMessage).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useSendMessageViewModel());

    act(() => result.current.setText("hello"));
    await act(() => result.current.sendMessage());

    expect(messagingControllers.sendMessage).toHaveBeenCalledWith({
      text: "hello",
      roomId: ACTIVE_ROOM.id,
    });
    expect(result.current.text).toBe("");
    expect(result.current.error).toBeNull();
    expect(result.current.isSending).toBe(false);
  });

  it("keeps the text and sets the error on failure", async () => {
    vi.mocked(messagingControllers.sendMessage).mockResolvedValue({
      success: false,
      message: "Unable to send message right now",
    });
    const { result } = renderHook(() => useSendMessageViewModel());

    act(() => result.current.setText("hello"));
    await act(() => result.current.sendMessage());

    expect(result.current.text).toBe("hello");
    expect(result.current.error).toBe("Unable to send message right now");
  });

  it("does not call the controller when there is no active room", async () => {
    useActiveRoom.setState({ activeRoom: null });
    const { result } = renderHook(() => useSendMessageViewModel());

    act(() => result.current.setText("hello"));
    await act(() => result.current.sendMessage());

    expect(messagingControllers.sendMessage).not.toHaveBeenCalled();
  });

  it("does not call the controller when the text is empty or whitespace-only", async () => {
    const { result } = renderHook(() => useSendMessageViewModel());

    act(() => result.current.setText("   "));
    await act(() => result.current.sendMessage());

    expect(messagingControllers.sendMessage).not.toHaveBeenCalled();
  });

  it("sets isSending true while the send is in flight", async () => {
    let resolveSend!: (value: Awaited<ReturnType<typeof messagingControllers.sendMessage>>) => void;
    const pending = new Promise<Awaited<ReturnType<typeof messagingControllers.sendMessage>>>(
      (resolve) => {
        resolveSend = resolve;
      },
    );
    vi.mocked(messagingControllers.sendMessage).mockReturnValue(pending);
    const { result } = renderHook(() => useSendMessageViewModel());

    act(() => result.current.setText("hello"));
    let sendPromise!: Promise<void>;
    act(() => {
      sendPromise = result.current.sendMessage();
    });

    expect(result.current.isSending).toBe(true);

    resolveSend({ success: true });
    await act(() => sendPromise);

    expect(result.current.isSending).toBe(false);
  });
});
