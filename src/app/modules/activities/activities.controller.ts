import { Request, Response } from "express";
import { activityService } from "./activites.service";
import { catchAsync } from "../../shared/cathAsync";

const createActivity = async (req: Request, res: Response) => {
  try {
    console.log("THE REQUEST REACHED HERE");
    const { name, description, imageUrl, visibility } = req.body as any;
    const {
      unit,
      targetValue,
      scheduleType,
      taskName,
      taskDescription,
      taskImage,
      days,
    } = req.body as any;

    const taskPayload = {
      unit,
      targetValue,
      scheduleType,
      taskName,
      taskDescription,
      taskImage,
      days,
    };

    const activityPayload = {
      name,
      description,
      imageUrl,
      visibility,
    };

    console.log(req.user)

    const activity = await activityService.createActivity(
      activityPayload,
      taskPayload,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Activity created successfully",
      data: activity,
    });
  } catch (error: any) {
    console.log(error.message)
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create activity",
      error: error.message,
    });
  }
};

const createTask = async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    console.log(req.body)
    const {
      unit,
      targetValue,
      scheduleType,
      name: taskName,
      description: taskDescription,
      imageUrl: taskImage,
      days,
    } = req.body as any;

    const taskPayload = {
      unit,
      targetValue,
      scheduleType,
      taskName,
      taskDescription,
      taskImage,
      days,
    };

    const task = await activityService.createTask(
      activityId as string,
      taskPayload,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create task",
      error: error.message,
    });
  }
};

const getMyCreatedActivity = async (req: Request, res: Response) => {
  try {
    //console.log("I am here", req.user)


    const activities = await activityService.getMyCreatedActivity(req.user.userId);

    res.status(200).json({
      success: true,
      message: "Activities retrieved successfully",
      data: activities,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve activities",
      error: error.message,
    });
  }
};
const getMyActivity = async (req: Request, res: Response) => {
  try {
    //console.log("I am here", req.user)


    const activities = await activityService.getMyActivity(req.user.userId);

    res.status(200).json({
      success: true,
      message: "Activities retrieved successfully",
      data: activities,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve activities",
      error: error.message,
    });
  }
};

const getPublicActivities = async (req: Request, res: Response) => {
  try {
    const activities = await activityService.getPublicActivites();

    res.status(200).json({
      success: true,
      message: "Public activities retrieved successfully",
      data: activities,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve public activities",
      error: error.message,
    });
  }
};

const joinActivity = async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    const result = await activityService.joinActivity(
      activityId as string,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Joined activity successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to join activity",
      error: error.message,
    });
  }
};

const leaveActivity = async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    const result = await activityService.leaveActivity(
      activityId as string,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Left activity successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to leave activity",
      error: error.message,
    });
  }
};

const getActivityMembers = async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    const members = await activityService.getActivityMembers(activityId as string);

    res.status(200).json({
      success: true,
      message: "Activity members retrieved successfully",
      data: members,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve activity members",
      error: error.message,
    });
  }
};

const sendInvite = async (req: Request, res: Response) => {
  console.log("the request reached here",req.user)
  try {
    const { activityId, receiverId, activityName } = req.body;
    

    const result = await activityService.sendInvite(
      activityName,
      req.user.userId,
      receiverId,
      activityId
    );

    res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to send invitation",
      error: error.message,
    });
  }
};

const getActivityInfo = async (req: Request, res: Response) => {
  try {
    console.log("the request reached hereeeeeeeeee",req.user)
    const { activityId } = req.params;
    const userId = req.user?.userId 
    console.log("this is the user Id",userId)
    const activity = await activityService.getActivityInfo(activityId as string, userId);

    //console.log("THIS IS THE ACTIVITY", activity[0]);

    res.status(200).json({
      success: true,
      message: "Activity info retrieved successfully",
      data: activity,
    });
    
  } catch (error: any) {
    console.log(error.message)
    res.status(501).json({
      success: false,
      message: error.message || "Failed to retrieve activity info",
      error: error.message,
    });
  }
}

const totalCompletedTask = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await activityService.totalCompletedTask(userId);
  res.status(200).json({
    success: true,
    message: "Total completed task retrieved successfully",
    data: result,
  });
})

const getSchedules = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId;
  const result = await activityService.getSchedules(taskId as string);
  res.status(200).json({
    success: true,
    message: "Schedules retrieved successfully",
    data: result,
  });
})

export const activityController = {
  getActivityInfo,
  createActivity,
  createTask,
  getMyActivity,
  getPublicActivities,
  joinActivity,
  leaveActivity,
  getActivityMembers,
  sendInvite,
  getMyCreatedActivity,
  totalCompletedTask,
  //getAllActivities,
  getSchedules
};
