import { httpClient } from "@/lib/httpClient";
import {
  contactsSearchResponseSchema,
  type ContactsSearchResponse,
} from "../types";

export const searchContactGateway = async (
  email: string,
): Promise<ContactsSearchResponse> => {
  const response = await httpClient.post("/contacts/search", { email });
  return contactsSearchResponseSchema.parse(response.data);
};

export const addContactGateway = async ({
  contactId,
}: {
  contactId: string;
}) => {
  const response = await httpClient.post("/contacts/add", {
    contactId,
  });

  return response.data;
};
