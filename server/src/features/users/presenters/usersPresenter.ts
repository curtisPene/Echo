import { User } from "../models/userModel";

export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export const userPresenter = (user: User): PublicUser => ({
  id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
});
