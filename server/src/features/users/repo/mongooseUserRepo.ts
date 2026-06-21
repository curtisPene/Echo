import mongoose from "mongoose";
import { User } from "../models/userModel";
import { Room } from "../../rooms/models/roomModel";

export type CreateUserResult =
  | { success: true; user: User }
  | { success: false; reason: "duplicate_email" | "validation" | "unknown" };

export async function findUserById({ id }: { id: string }) {
  const userDoc = await User.findById(id);

  if (!userDoc) return null;

  const user = userDoc.toJSON();

  return user;
}

export async function findUserByEmail({ email }: { email: string }) {
  const userDoc = await User.findOne({ email });

  if (!userDoc) return null;

  const user = userDoc.toJSON();

  return user;
}

export async function createUser({
  user,
}: {
  user: Omit<User, "_id">;
}): Promise<CreateUserResult> {
  try {
    const userDoc = await User.create(user);
    return { success: true, user: userDoc.toJSON() };
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

export async function findLikeEmail({
  email,
}: {
  email: string;
}): Promise<User[]> {
  const userDocs = await User.find({
    email: { $regex: email, $options: "i" },
  });

  return userDocs.map((doc) => doc.toJSON());
}
