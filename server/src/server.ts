import "dotenv/config";
import mongoose from "mongoose";

const uri =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_URI_ATLAS
    : process.env.MONGO_URI_LOCAL;

if (!uri) {
  throw new Error(
    process.env.NODE_ENV === "production"
      ? "MONGO_URI_ATLAS is not defined"
      : "MONGO_URI_LOCAL is not defined",
  );
}

export const mongooseConnect = async () => {
  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB,
  });
  console.log("Connected to MongoDB");
  return mongoose.connection;
};

export const close = async () => {
  await mongoose.disconnect();
};
