import { describe, expect, it } from "vitest";
import { SearchContactService } from "../../services/SearchContactService";
import { User } from "../../entities/user";
import type { ContactsApi } from "../../ports/ContactsApi";

const FOUND_USER = User.hydrate({
  id: "user-2",
  firstName: "Grace",
  lastName: "Hopper",
  email: "grace@example.com",
});

function createFakeContactsApi(overrides: Partial<ContactsApi> = {}): ContactsApi {
  return {
    async search() {
      return {
        success: true,
        message: "User found",
        data: FOUND_USER,
      };
    },
    async add() {
      throw new Error("not used in this test");
    },
    async block() {
      throw new Error("not used in this test");
    },
    ...overrides,
  };
}

describe("SearchContactService", () => {
  it("returns the found user on success", async () => {
    const service = new SearchContactService(createFakeContactsApi());

    const result = await service.execute({ email: "grace@example.com" });

    expect(result).toEqual({
      success: true,
      message: "User found",
      data: FOUND_USER,
    });
  });

  it("surfaces the api's failure message when the user is not found", async () => {
    const contactsApi = createFakeContactsApi({
      async search() {
        return { success: false, message: "User not found", data: null };
      },
    });
    const service = new SearchContactService(contactsApi);

    const result = await service.execute({ email: "nobody@example.com" });

    expect(result).toEqual({
      success: false,
      message: "User not found",
      data: null,
    });
  });

  it("surfaces the api's failure message when the found user has blocked the viewer", async () => {
    const contactsApi = createFakeContactsApi({
      async search() {
        return { success: false, message: "User blocked", data: null };
      },
    });
    const service = new SearchContactService(contactsApi);

    const result = await service.execute({ email: "grace@example.com" });

    expect(result).toEqual({
      success: false,
      message: "User blocked",
      data: null,
    });
  });

  it("returns a generic failure when the api throws", async () => {
    const contactsApi = createFakeContactsApi({
      async search() {
        throw new Error("network down");
      },
    });
    const service = new SearchContactService(contactsApi);

    const result = await service.execute({ email: "grace@example.com" });

    expect(result).toEqual({
      success: false,
      message: "An unexpected error occurred",
      data: null,
    });
  });
});
