import express from "express";
import type { AuthControllers } from "../controllers/authHttpControllers";

export const createAuthRouter = (controllers: AuthControllers) => {
  const router = express.Router();

  router.post("/login", controllers.userLoginController);

  router.post("/register", controllers.userRegistrationController);

  router.post("/verify", controllers.verifyRefreshTokenController);

  router.post("/logout", controllers.userLogoutController);

  router.post("/delete-account", controllers.deleteAccountController);

  return router;
};
