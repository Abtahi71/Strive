import { Request, Response } from "express";

import { conversationService } from "./conversation.service";
import { catchAsync } from "../../shared/cathAsync";
import AppError from "../../errorHelpers/AppError";

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const { activityId } = req.params;

  if (!activityId) {
    throw new AppError(400, "Activity ID is required");
  }

  const messages = await conversationService.getMessages(activityId as string, userId);

  res.status(200).json({
    success: true,
    message: "Messages retrieved successfully",
    data: messages,
  });
});

const editMessage = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const { messageId } = req.params;

  const { content } = req.body;

  if (!messageId) {
    throw new AppError(400, "Message ID is required");
  }

  if (!content) {
    throw new AppError(400, "Message content is required");
  }

  const message = await conversationService.editMessage(
    messageId as string,
    userId,
    content
  );

  res.status(200).json({
    success: true,
    message: "Message updated successfully",
    data: message,
  });
});

const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;

  const { messageId } = req.params;

  if (!messageId) {
    throw new AppError(400, "Message ID is required");
  }

  const message = await conversationService.deleteMessage(messageId as string, userId);

  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
    data: message,
  });
});

export const conversationController = {
  getMessages,
  editMessage,
  deleteMessage,
};
