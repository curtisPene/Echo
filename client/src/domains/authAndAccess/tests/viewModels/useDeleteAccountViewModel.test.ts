// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDeleteAccountViewModel } from "../../viewModels/useDeleteAccountViewModel";
import { authControllers } from "@/composition";

beforeEach(() => {
  vi.spyOn(authControllers, "deleteAccount");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useDeleteAccountViewModel", () => {
  it("starts not confirming, not deleting, no error", () => {
    const { result } = renderHook(() => useDeleteAccountViewModel());

    expect(result.current.isConfirming).toBe(false);
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("openConfirm sets isConfirming true without calling the controller", () => {
    const { result } = renderHook(() => useDeleteAccountViewModel());

    act(() => result.current.openConfirm());

    expect(result.current.isConfirming).toBe(true);
    expect(authControllers.deleteAccount).not.toHaveBeenCalled();
  });

  it("cancel resets isConfirming to false", () => {
    const { result } = renderHook(() => useDeleteAccountViewModel());

    act(() => result.current.openConfirm());
    act(() => result.current.cancel());

    expect(result.current.isConfirming).toBe(false);
  });

  it("confirmDelete calls the controller and clears isConfirming on success", async () => {
    vi.mocked(authControllers.deleteAccount).mockResolvedValue({
      success: true,
      message: "Account deleted successfully",
      data: null,
    });
    const { result } = renderHook(() => useDeleteAccountViewModel());

    act(() => result.current.openConfirm());
    await act(() => result.current.confirmDelete());

    expect(authControllers.deleteAccount).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
    expect(result.current.isDeleting).toBe(false);
  });

  it("sets the error on failure", async () => {
    vi.mocked(authControllers.deleteAccount).mockResolvedValue({
      success: false,
      message: "Something went wrong",
      data: null,
    });
    const { result } = renderHook(() => useDeleteAccountViewModel());

    await act(() => result.current.confirmDelete());

    expect(result.current.error).toBe("Something went wrong");
  });

  it("sets isDeleting true while the request is in flight", async () => {
    let resolveDelete!: (value: Awaited<ReturnType<typeof authControllers.deleteAccount>>) => void;
    const pending = new Promise<Awaited<ReturnType<typeof authControllers.deleteAccount>>>(
      (resolve) => {
        resolveDelete = resolve;
      },
    );
    vi.mocked(authControllers.deleteAccount).mockReturnValue(pending);
    const { result } = renderHook(() => useDeleteAccountViewModel());

    let deletePromise!: Promise<unknown>;
    act(() => {
      deletePromise = result.current.confirmDelete();
    });

    expect(result.current.isDeleting).toBe(true);

    resolveDelete({ success: true, message: "Account deleted successfully", data: null });
    await act(() => deletePromise);

    expect(result.current.isDeleting).toBe(false);
  });
});
