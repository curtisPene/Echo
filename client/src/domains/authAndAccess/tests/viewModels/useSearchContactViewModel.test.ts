// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSearchContactViewModel } from "../../viewModels/useSearchContactViewModel";
import { contactsControllers } from "@/composition";

const FOUND_USER = {
  id: "user-2",
  firstName: "Grace",
  lastName: "Hopper",
  email: "grace@example.com",
};

beforeEach(() => {
  vi.spyOn(contactsControllers, "searchContact");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useSearchContactViewModel", () => {
  it("starts with empty query, no results, no error, not searching", () => {
    const { result } = renderHook(() => useSearchContactViewModel());

    expect(result.current.query).toBe("");
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isSearching).toBe(false);
  });

  it("updates query via setQuery without triggering a search", () => {
    const { result } = renderHook(() => useSearchContactViewModel());

    act(() => result.current.setQuery("grace@example.com"));

    expect(result.current.query).toBe("grace@example.com");
    expect(contactsControllers.searchContact).not.toHaveBeenCalled();
  });

  it("search calls the controller with the current query and populates results on success", async () => {
    vi.mocked(contactsControllers.searchContact).mockResolvedValue({
      success: true,
      user: FOUND_USER,
    });
    const { result } = renderHook(() => useSearchContactViewModel());

    act(() => result.current.setQuery("grace@example.com"));
    await act(() => result.current.search());

    expect(contactsControllers.searchContact).toHaveBeenCalledWith({
      email: "grace@example.com",
    });
    expect(result.current.results).toEqual([FOUND_USER]);
    expect(result.current.error).toBeNull();
    expect(result.current.isSearching).toBe(false);
  });

  it("search sets the error and clears results on failure", async () => {
    vi.mocked(contactsControllers.searchContact).mockResolvedValue({
      success: false,
      message: "User not found",
    });
    const { result } = renderHook(() => useSearchContactViewModel());

    act(() => result.current.setQuery("nobody@example.com"));
    await act(() => result.current.search());

    expect(result.current.error).toBe("User not found");
    expect(result.current.results).toEqual([]);
  });

  it("sets isSearching true while the search is in flight", async () => {
    let resolveSearch!: (value: Awaited<ReturnType<typeof contactsControllers.searchContact>>) => void;
    const pending = new Promise<Awaited<ReturnType<typeof contactsControllers.searchContact>>>(
      (resolve) => {
        resolveSearch = resolve;
      },
    );
    vi.mocked(contactsControllers.searchContact).mockReturnValue(pending);
    const { result } = renderHook(() => useSearchContactViewModel());

    let searchPromise!: Promise<void>;
    act(() => {
      searchPromise = result.current.search();
    });

    expect(result.current.isSearching).toBe(true);

    resolveSearch({ success: true, user: FOUND_USER });
    await act(() => searchPromise);

    expect(result.current.isSearching).toBe(false);
  });
});
