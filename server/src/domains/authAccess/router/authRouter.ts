import express from "express";
import { authHttpControllers } from "../controllers/authHttpControllers";

const router = express.Router();

router.post("/login", authHttpControllers.login);

router.post("/register", authHttpControllers.register);

router.post("/verify", authHttpControllers.verifyRefreshToken);

export default router;
