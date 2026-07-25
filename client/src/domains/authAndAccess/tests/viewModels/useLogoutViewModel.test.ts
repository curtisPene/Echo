// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useLogoutViewModel } from "../../viewModels/useLogoutViewModel";
import { authControllers } from "@/composition";

beforeEach(() => {
  vi.spyOn(authControllers, "logout");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useLogoutViewModel", () => {
  it("logout forwards to the controller", async () => {
    vi.mocked(authControllers.logout).mockResolvedValue({
      success: true,
      message: "Logout successful",
      data: null,
    });
    const { result } = renderHook(() => useLogoutViewModel());

    await result.current.logout();

    expect(authControllers.logout).toHaveBeenCalledTimes(1);
  });
});
