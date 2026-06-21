import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGO_URI is not defined");
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
