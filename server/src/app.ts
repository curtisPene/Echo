import express from "express";
import cors from "cors";
import AuthRouter from "./features/auth/router/authRouter";
import ContactsRouter from "./features/contacts/router/contactsRouter";
import UserRouter from "./features/users/router/userRouter";
import RoomsRouter from "./features/rooms/router/roomsRouter";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./features/auth/middleware/authMiddleware";

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
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

  return app;
};
