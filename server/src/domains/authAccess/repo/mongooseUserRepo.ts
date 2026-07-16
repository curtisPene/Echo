import mongoose, { HydratedDocument } from "mongoose";
import { User as UserMongooseModel } from "../mongooseModels/userModel";
import { User, User as UserDomain } from "../domainModels/authUser";

export type CreateUserResult =
  | { success: true; user: User }
  | { success: false; reason: "duplicate_email" | "validation" | "unknown" };

function hydrateUser(userDoc: HydratedDocument<UserMongooseModel>): User {
  const raw = userDoc.toJSON();
  return UserDomain.createUser({
    id: raw._id.toString(),
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    password: raw.password,
  });
}

export const userRepo = {
  async findUserById({ id }: { id: string }): Promise<User | null> {
    const userDoc = await UserMongooseModel.findById(id);

    if (!userDoc) return null;

    return hydrateUser(userDoc);
  },

  async findUserByEmail({ email }: { email: string }): Promise<User | null> {
    const userDoc = await UserMongooseModel.findOne({ email });

    if (!userDoc) return null;

    return hydrateUser(userDoc);
  },

  async createUser({
    user,
  }: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    };
  }): Promise<CreateUserResult> {
    try {
      const userDoc = await UserMongooseModel.create(user);
      return { success: true, user: hydrateUser(userDoc) };
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return { success: false, reason: "validation" };
      }

      if (
        error instanceof mongoose.mongo.MongoServerError &&
        error.code === 11000
      ) {
        return { success: false, reason: "duplicate_email" };
      }

      return { success: false, reason: "unknown" };
    }
  },

  async findLikeEmail({ email }: { email: string }): Promise<User[]> {
    const userDocs = await UserMongooseModel.find({
      email: { $regex: email, $options: "i" },
    });

    return userDocs.map(hydrateUser);
  },
};
