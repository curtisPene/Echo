import mongoose from "mongoose";
import { User as UserDoc } from "../models/userModel";
import { User, NewUser } from "../domainModels/user";
import { UserRepository, CreateUserResult } from "../ports/UserRepository";

export class UserRepo implements UserRepository {
  async findById({ id }: { id: string }): Promise<User | null> {
    const userDoc = await UserDoc.findById(id);

    if (!userDoc) return null;

    return User.hydrate(userDoc.toJSON());
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const userDocs = await UserDoc.find({ _id: { $in: ids } });

    return userDocs.map((doc) => User.hydrate(doc.toJSON()));
  }

  async findByEmail({ email }: { email: string }): Promise<User | null> {
    const userDoc = await UserDoc.findOne({ email });

    if (!userDoc) return null;

    return User.hydrate(userDoc.toJSON());
  }

  async create(user: NewUser): Promise<CreateUserResult> {
    try {
      const userDoc = await UserDoc.create(user);
      return { success: true, user: User.hydrate(userDoc.toJSON()) };
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
  }

  async findLikeEmail({ email }: { email: string }): Promise<User[]> {
    const userDocs = await UserDoc.find({
      email: { $regex: email, $options: "i" },
    });

    return userDocs.map((doc) => User.hydrate(doc.toJSON()));
  }
}

export const userRepo = new UserRepo();
