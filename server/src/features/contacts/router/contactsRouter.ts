import express, { NextFunction, Request, Response } from "express";
import {
  addContactController,
  searchContactController,
} from "../controllers/contactsController";

const router = express.Router();

router.post("/search", searchContactController);

router.post("/request", searchContactController);

router.post("/add", addContactController);

export default router;
