import mongoose from "mongoose";
import { User as UserDoc } from "../models/userModel";
import { AuthUser, NewAuthUser } from "../domainModels/authUser";
import { UserRepository, CreateUserResult } from "../ports/UserRepository";

export class UserRepo implements UserRepository {
  async findById({ id }: { id: string }): Promise<AuthUser | null> {
    const userDoc = await UserDoc.findById(id);

    if (!userDoc) return null;

    return AuthUser.hydrate(userDoc.toJSON());
  }

  async findByIds(ids: string[]): Promise<AuthUser[]> {
    const userDocs = await UserDoc.find({ _id: { $in: ids } });

    return userDocs.map((doc) => AuthUser.hydrate(doc.toJSON()));
  }

  async findByEmail({ email }: { email: string }): Promise<AuthUser | null> {
    const userDoc = await UserDoc.findOne({ email });

    if (!userDoc) return null;

    return AuthUser.hydrate(userDoc.toJSON());
  }

  async create(user: NewAuthUser): Promise<CreateUserResult> {
    try {
      const userDoc = await UserDoc.create(user);
      return { success: true, user: AuthUser.hydrate(userDoc.toJSON()) };
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

  async findLikeEmail({ email }: { email: string }): Promise<AuthUser[]> {
    const userDocs = await UserDoc.find({
      email: { $regex: email, $options: "i" },
    });

    return userDocs.map((doc) => AuthUser.hydrate(doc.toJSON()));
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const result = await UserDoc.deleteOne({ _id: id });

    return result.deletedCount > 0;
  }
}

export const userRepo = new UserRepo();
