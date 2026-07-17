import "dotenv/config";
import express from "express";
import cors from "cors";
import AuthRouter from "./domains/authAndAccess/router/authRouter";
import ContactsRouter from "./domains/authAndAccess/router/contactsRouter";
import UserRouter from "./domains/authAndAccess/router/userRouter";
import RoomsRouter from "./domains/conversations/router/roomsRouter";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./domains/authAndAccess/middleware/authMiddleware";
import { errorHandler } from "./middleware/errorHandler";

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(authMiddleware);

  app.use("/auth", AuthRouter);
  app.use("/user", UserRouter);
  app.use("/contacts", ContactsRouter);
  app.use("/rooms", RoomsRouter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(errorHandler);

  return app;
};
