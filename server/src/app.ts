import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createAuthRouter } from "./domains/authAndAccess/router/authRouter";
import { createContactsRouter } from "./domains/authAndAccess/router/contactsRouter";
import { createUserRouter } from "./domains/authAndAccess/router/userRouter";
import { createRoomsRouter } from "./domains/conversations/router/roomsRouter";
import { createAuthMiddleware } from "./domains/authAndAccess/middleware/authMiddleware";
import { errorHandler } from "./middleware/errorHandler";
import type { VerifyAccessTokenService } from "./domains/authAndAccess/services/VerifyAccessTokenService";
import type { AuthControllers } from "./domains/authAndAccess/controllers/authHttpControllers";
import type { ContactsControllers } from "./domains/authAndAccess/controllers/contactsHttpControllers";
import type { UserControllers } from "./domains/authAndAccess/controllers/httpUserControllers";
import type { RoomsControllers } from "./domains/conversations/controllers/httpControllers";

export const createApp = (composition: {
  verifyAccessTokenService: VerifyAccessTokenService;
  authControllers: AuthControllers;
  contactsControllers: ContactsControllers;
  userControllers: UserControllers;
  roomsControllers: RoomsControllers;
}) => {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(createAuthMiddleware(composition.verifyAccessTokenService));

  app.use("/auth", createAuthRouter(composition.authControllers));
  app.use("/user", createUserRouter(composition.userControllers));
  app.use("/contacts", createContactsRouter(composition.contactsControllers));
  app.use("/rooms", createRoomsRouter(composition.roomsControllers));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(errorHandler);

  return app;
};
