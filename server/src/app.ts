import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createAuthRouter } from "./domains/authAndAccess/router/authRouter";
import { createContactsRouter } from "./domains/authAndAccess/router/contactsRouter";
import { createSyncRouter } from "./domains/sync/router/syncRouter";
import { createRoomsRouter } from "./domains/conversations/router/roomsRouter";
import { createAuthMiddleware } from "./domains/authAndAccess/middleware/authMiddleware";
import { errorHandler } from "./middleware/errorHandler";
import type { VerifyAccessTokenService } from "./domains/authAndAccess/services/VerifyAccessTokenService";
import type { AuthControllers } from "./domains/authAndAccess/controllers/authHttpControllers";
import type { ContactsControllers } from "./domains/authAndAccess/controllers/contactsHttpControllers";
import type { SyncControllers } from "./domains/sync/controllers/httpControllers";
import type { RoomsControllers } from "./domains/conversations/controllers/httpControllers";

export const createApp = (composition: {
  verifyAccessTokenService: VerifyAccessTokenService;
  authControllers: AuthControllers;
  contactsControllers: ContactsControllers;
  syncControllers: SyncControllers;
  roomsControllers: RoomsControllers;
}) => {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(createAuthMiddleware(composition.verifyAccessTokenService));

  app.use("/auth", createAuthRouter(composition.authControllers));
  app.use("/sync", createSyncRouter(composition.syncControllers));
  app.use("/contacts", createContactsRouter(composition.contactsControllers));
  app.use("/rooms", createRoomsRouter(composition.roomsControllers));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(errorHandler);

  return app;
};
