import type { ServiceResult } from "@/types";
import type { User } from "../entities/user";
import type { ContactsApi } from "../ports/ContactsApi";
import { DomainError } from "@/errors/DomainError";
import { RepoError } from "@/errors/RepoError";
import { HttpError } from "@/errors/HttpError";

export class SearchContactService {
  private readonly contactsApi: ContactsApi;

  constructor(contactsApi: ContactsApi) {
    this.contactsApi = contactsApi;
  }

  async execute({ email }: { email: string }): Promise<ServiceResult<User>> {
    try {
      const response = await this.contactsApi.search(email);

      if (!response.success || !response.data) {
        return {
          success: false,
          message: response.message,
          data: null,
        };
      }

      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    } catch (error) {
      if (
        error instanceof DomainError ||
        error instanceof RepoError ||
        error instanceof HttpError
      ) {
        return { success: false, message: error.message, data: null };
      }

      return {
        success: false,
        message: "An unexpected error occurred",
        data: null,
      };
    }
  }
}
