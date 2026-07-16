import express from "express";
import {
  userLoginController,
  userRegistrationController,
  verifyRefreshTokenController,
} from "../controllers/authHttpControllers";

const router = express.Router();

router.post("/login", userLoginController);

router.post("/register", userRegistrationController);

router.post("/verify", verifyRefreshTokenController);

export default router;
