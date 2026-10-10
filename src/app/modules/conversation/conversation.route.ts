import { Router } from "express";
import { conversationController } from "./conversation.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { GlobalRole } from "../../../../prisma/generated/prisma/enums";


const router = Router();

router.get(
  "/:activityId/messages",
  checkAuth(GlobalRole.USER),
  conversationController.getMessages
);

router.patch(
  "/messages/:messageId",
  checkAuth(GlobalRole.USER),
  conversationController.editMessage
);

router.delete(
  "/messages/:messageId",
  checkAuth(GlobalRole.USER),
  conversationController.deleteMessage
);

export const conversationRouter = router;
