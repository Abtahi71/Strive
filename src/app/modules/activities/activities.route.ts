import express from "express";
import { activityController } from "./activities.controller";
import { checkAuth, optionalAuth } from "../../middleware/checkAuth";
import { GlobalRole } from "../../../../prisma/generated/prisma/enums";

const router = express.Router();




router.post("/create",checkAuth(GlobalRole.USER), activityController.createActivity);
router.get(
  "/my-activities",
  checkAuth(GlobalRole.USER),
  activityController.getMyActivity
);
router.get(
  "/created-activities",
  checkAuth(GlobalRole.USER),
  activityController.getMyCreatedActivity
);
router.get("/public-activities", activityController.getPublicActivities);
router.post("/join-activity", activityController.joinActivity);
router.post("/leave-activity", activityController.leaveActivity);
router.post(
  "/send-invite",
  checkAuth(GlobalRole.USER),
  activityController.sendInvite
);
router.get("/totalCompletedTask", checkAuth(GlobalRole.USER), activityController.totalCompletedTask);
router.post("/create-task/:activityId", checkAuth(GlobalRole.USER), activityController.createTask);
router.get("/activity-info/:activityId",
  checkAuth(GlobalRole.USER),//optionalAuth(GlobalRole.USER),
   activityController.getActivityInfo);
router.get("/schedule/:taskId", activityController.getSchedules);



router.get("/activity-members/:activityId", activityController.getActivityMembers);




export const activityRoutes = router