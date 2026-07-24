// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useBlockContactViewModel } from "../../viewModels/useBlockContactViewModel";
import { contactsControllers } from "@/composition";
import type { ContactDTO } from "../../entities/contacts";

const BLOCKED_CONTACT: ContactDTO = {
  userId: "user-2",
  firstName: "Grace",
  lastName: "Hopper",
  email: "grace@example.com",
};

beforeEach(() => {
  vi.spyOn(contactsControllers, "blockContact");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useBlockContactViewModel", () => {
  it("starts not confirming, not blocking, no error", () => {
    const { result } = renderHook(() => useBlockContactViewModel());

    expect(result.current.isConfirming).toBe(false);
    expect(result.current.isBlocking).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("openConfirm sets isConfirming true without calling the controller", () => {
    const { result } = renderHook(() => useBlockContactViewModel());

    act(() => result.current.openConfirm());

    expect(result.current.isConfirming).toBe(true);
    expect(contactsControllers.blockContact).not.toHaveBeenCalled();
  });

  it("cancel resets isConfirming to false", () => {
    const { result } = renderHook(() => useBlockContactViewModel());

    act(() => result.current.openConfirm());
    act(() => result.current.cancel());

    expect(result.current.isConfirming).toBe(false);
  });

  it("confirmBlock calls the controller with the given contact and closes the confirmation on success", async () => {
    vi.mocked(contactsControllers.blockContact).mockResolvedValue({
      success: true,
      blockedContactId: BLOCKED_CONTACT.userId,
    });
    const { result } = renderHook(() => useBlockContactViewModel());

    act(() => result.current.openConfirm());
    await act(() => result.current.confirmBlock(BLOCKED_CONTACT));

    expect(contactsControllers.blockContact).toHaveBeenCalledWith({
      blockedContact: BLOCKED_CONTACT,
    });
    expect(result.current.isConfirming).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isBlocking).toBe(false);
  });

  it("keeps the confirmation open and sets the error on failure", async () => {
    vi.mocked(contactsControllers.blockContact).mockResolvedValue({
      success: false,
      message: "Not authenticated",
    });
    const { result } = renderHook(() => useBlockContactViewModel());

    act(() => result.current.openConfirm());
    await act(() => result.current.confirmBlock(BLOCKED_CONTACT));

    expect(result.current.isConfirming).toBe(true);
    expect(result.current.error).toBe("Not authenticated");
  });

  it("sets isBlocking true while the request is in flight", async () => {
    let resolveBlock!: (value: Awaited<ReturnType<typeof contactsControllers.blockContact>>) => void;
    const pending = new Promise<Awaited<ReturnType<typeof contactsControllers.blockContact>>>(
      (resolve) => {
        resolveBlock = resolve;
      },
    );
    vi.mocked(contactsControllers.blockContact).mockReturnValue(pending);
    const { result } = renderHook(() => useBlockContactViewModel());

    let blockPromise!: Promise<unknown>;
    act(() => {
      blockPromise = result.current.confirmBlock(BLOCKED_CONTACT);
    });

    expect(result.current.isBlocking).toBe(true);

    resolveBlock({ success: true, blockedContactId: BLOCKED_CONTACT.userId });
    await act(() => blockPromise);

    expect(result.current.isBlocking).toBe(false);
  });
});
