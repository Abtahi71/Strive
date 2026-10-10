import { Request, Response } from "express";
import { catchAsync } from "../../shared/cathAsync"; 
import { achievementServices } from "./achievement.service";


const createTaskAchievement = catchAsync(
  async (req: Request, res: Response) => {
    const {taskId} = req.params
    const payload = req.body;

    const achievement = await achievementServices.createTaskAchievement(
      payload,taskId as string
    );

    res.status(201).json({
      success: true,
      message: "Task achievement created successfully",
      data: achievement,
    });
  }
);

const getAchievement = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const achievements = await achievementServices.getAchievement(taskId as string);

  res.status(200).json({
    success: true,
    message: "Task achievements retrieved successfully",
    data: achievements,
  });
});

const getMyAchievements = catchAsync(async (req: Request, res: Response) => {

  const userId = req.user.userId as string

  if (!userId) {
    res.status(401).json({
      success: false,
      message:
        "Unauthorized: User ID is required. Please ensure you are authenticated.",
    });
    return;
  }

  const achievements = await achievementServices.getMyAchievements(userId);

  res.status(200).json({
    success: true,
    message: "My task achievements retrieved successfully",
    data: achievements,
  });
});

export const achievementControllers = {
  createTaskAchievement,
  getAchievement,
  getMyAchievements,
};
