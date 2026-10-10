import { GlobalRole } from '../../../../prisma/generated/prisma/enums';
import { checkAuth } from '../../middleware/checkAuth';
import { UserController } from './users.controller';
import  express  from 'express';

// export const userController = {
//   getFriendRequests,
//   getFriendsList,
//   sendFriendRequest,
//   acceptInvite,
//   getUserInvitations,
//   createProgress,
//   viewTaskProgress,
//   getTodaysTasks,
//   dailyProgressAnalytics,
// };

const router = express.Router()





// Friend routes
router.get("/friend-requests",checkAuth(GlobalRole.USER), UserController.getFriendRequests);
router.get("/username",checkAuth(GlobalRole.USER), UserController.getUserWithUsername);
//router.get("/friends",checkAuth(GlobalRole.USER), UserController.getFriendList);

router.get("/friends",checkAuth(GlobalRole.USER), UserController.getFriendList);
router.post("/friend-request/:id",checkAuth(GlobalRole.USER), UserController.sendFriendRequest);
router.put("/friend-request/accept/:id",checkAuth(GlobalRole.USER), UserController.acceptFriendRequest);

// Invitation routes
router.get("/invitations",checkAuth(GlobalRole.USER), UserController.getUserInvitations);
router.get("/invitations/:activityId",checkAuth(GlobalRole.USER), UserController.getInvites);
router.post("/invitations/send", UserController.sendInvite);
router.post("/invitations/accept",checkAuth(GlobalRole.USER), UserController.acceptInvite);

// Progress routes
router.post("/progress",checkAuth(GlobalRole.USER), UserController.createProgress);
router.get("/progress/task/:taskId",checkAuth(GlobalRole.USER), UserController.viewTaskProgress);

// Leadership routes
router.get("/leadership/daily/:taskId", UserController.getDailyLeadership);
router.get("/leadership/task/:taskId", UserController.getTaskLeadership);
router.get(
  "/leadership/activity/:activityId",
  UserController.getActivityLeadership
);

router.get("/isCompleted/:activityId",checkAuth(GlobalRole.USER), UserController.isTaskCompleted);

// Task routes
router.get("/tasks/today/:activityId",checkAuth(GlobalRole.USER), UserController.getTodaysTasks);

// Analytics routes
router.get(
  "/analytics/daily/:activityId",
  checkAuth(GlobalRole.USER),
  UserController.dailyProgressAnalytics
);

export const userRoutes = router;
