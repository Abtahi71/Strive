import { GlobalRole } from "../../../../prisma/generated/prisma/enums";
import { Router } from "express";
import { AuthControllers } from "./auth.controller.js";
import { checkAuth, optionalAuth } from "../../middleware/checkAuth.js";

const router = Router();

// Public
router.post("/register", AuthControllers.register);
router.post("/login", AuthControllers.login);
router.post("/refresh", AuthControllers.refresh);

router.get("/google/callback", AuthControllers.googleLogin);

// Requires only a valid access token — no role restriction
router.post("/logout", checkAuth(), AuthControllers.logout);
router.post("/logout-all", checkAuth(), AuthControllers.logoutAllDevices);
router.get(
  "/me",
  checkAuth(GlobalRole.USER), //optionalAuth(),
  AuthControllers.getMe
);
router.patch("/change-password", checkAuth(), AuthControllers.changePassword);
router.get("/verify", checkAuth(), AuthControllers.verifyToken);

export const AuthRoutes = router;
