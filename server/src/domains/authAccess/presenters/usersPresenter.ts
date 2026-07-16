import { User } from "../domainModels/authUser";

export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export const userPresenter = (user: User): PublicUser => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
};
