import express, { NextFunction, Request, Response } from "express";
import {
  addContactController,
  blockContactController,
  searchContactController,
} from "../controllers/httpControllers";

const router = express.Router();

router.post("/search", searchContactController);

router.post("/request", searchContactController);

router.post("/add", addContactController);

router.post("/block", blockContactController);

export default router;
