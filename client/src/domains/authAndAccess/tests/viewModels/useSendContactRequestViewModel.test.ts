// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSendContactRequestViewModel } from "../../viewModels/useSendContactRequestViewModel";
import { contactsControllers } from "@/composition";

const CONTACT_DTO = {
  userId: "user-2",
  firstName: "Grace",
  lastName: "Hopper",
  email: "grace@example.com",
};

const ROOM_DTO = {
  id: "room-1",
  name: "Ada, Grace",
  participants: [],
};

beforeEach(() => {
  vi.spyOn(contactsControllers, "addContact");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useSendContactRequestViewModel", () => {
  it("starts with no error, not sending", () => {
    const { result } = renderHook(() => useSendContactRequestViewModel());

    expect(result.current.error).toBeNull();
    expect(result.current.isSending).toBe(false);
  });

  it("sendRequest calls the controller with the given contact id and returns success", async () => {
    vi.mocked(contactsControllers.addContact).mockResolvedValue({
      success: true,
      contact: CONTACT_DTO,
      room: ROOM_DTO,
    });
    const { result } = renderHook(() => useSendContactRequestViewModel());

    let outcome!: Awaited<ReturnType<typeof result.current.sendRequest>>;
    await act(async () => {
      outcome = await result.current.sendRequest("user-2");
    });

    expect(contactsControllers.addContact).toHaveBeenCalledWith({
      contactId: "user-2",
    });
    expect(outcome.success).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isSending).toBe(false);
  });

  it("sets the error on failure", async () => {
    vi.mocked(contactsControllers.addContact).mockResolvedValue({
      success: false,
      message: "Contact already added",
    });
    const { result } = renderHook(() => useSendContactRequestViewModel());

    await act(() => result.current.sendRequest("user-2"));

    expect(result.current.error).toBe("Contact already added");
  });

  it("sets isSending true while the request is in flight", async () => {
    let resolveSend!: (value: Awaited<ReturnType<typeof contactsControllers.addContact>>) => void;
    const pending = new Promise<Awaited<ReturnType<typeof contactsControllers.addContact>>>(
      (resolve) => {
        resolveSend = resolve;
      },
    );
    vi.mocked(contactsControllers.addContact).mockReturnValue(pending);
    const { result } = renderHook(() => useSendContactRequestViewModel());

    let sendPromise!: Promise<unknown>;
    act(() => {
      sendPromise = result.current.sendRequest("user-2");
    });

    expect(result.current.isSending).toBe(true);

    resolveSend({ success: true, contact: CONTACT_DTO, room: ROOM_DTO });
    await act(() => sendPromise);

    expect(result.current.isSending).toBe(false);
  });
});
