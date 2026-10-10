import express from "express";
 // Adjust the path to match your actual controller file name
import { checkAuth } from "../../middleware/checkAuth";
import { GlobalRole } from "../../../../prisma/generated/prisma/enums"; // Note: Use ActivityRole here if your auth logic is activity-specific
import { achievementControllers } from "./activities.controller";

const router = express.Router();

// Create a new task achievement (expects taskId and other details in req.body)
router.post(
  "/create/:taskId",
  checkAuth(GlobalRole.USER),
  achievementControllers.createTaskAchievement
);

// Get all achievements for a specific task
router.get(
  "/task/:taskId",
  checkAuth(GlobalRole.USER),
  achievementControllers.getAchievement
);

// Get the authenticated user's personal task achievements
router.get(
  "/my-achievements",
  checkAuth(GlobalRole.USER),
  achievementControllers.getMyAchievements
);

export const achievementRoutes = router;
