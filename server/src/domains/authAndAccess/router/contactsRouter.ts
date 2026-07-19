import express from "express";
import type { ContactsControllers } from "../controllers/contactsHttpControllers";

export const createContactsRouter = (controllers: ContactsControllers) => {
  const router = express.Router();

  router.post("/search", controllers.searchContactController);

  router.post("/request", controllers.searchContactController);

  router.post("/add", controllers.addContactController);

  router.post("/block", controllers.blockContactController);

  return router;
};
