// // const sendFriendRequest = async (senderId: string, receiverId: string) => {
// //   const result = await prisma.$transaction(async (tx: any) => {
// //     const request = await tx.friendship.create({
// //       data: {
// //         requesterId: senderId,
// //         receiverId: receiverId,
// //         status: "PENDING",
// //       },
// //     });
// //     const notification = await tx.notification.create({
// //       data: {
// //         title: "Friend Request",
// //         content: `You have a friend request from ${senderId}`,
// //         userId: receiverId,
// //         type: "FRIEND_REQUEST",
// //         data: { requestId: request.id },
// //       },
// //     });
// //     return { request, notification };
// //   });
// // };

// import type { Request, Response } from "express";
// import { catchAsync } from "../../shared/cathAsync";
// import { userService } from "./users.service";
// import AppError from "../../errorHelpers/AppError";

// // const acceptFriendRequest = async (requesterId: string, receiverId: string) => {
// //   //receiverID is me
// //   const result = await prisma.$transaction(async (tx: any) => {
// //     const request = await tx.friendship.update({
// //       where: {
// //         requesterId_receiverId: {
// //           requesterId: receiverId,
// //           receiverId: requesterId,
// //         },
// //         status: "PENDING",
// //       },
// //       data: { status: "ACCEPTED" },
// //     });
// //     const notification = await tx.notification.create({
// //       data: {
// //         title: "Friend Request",
// //         content: `Your friend request to ${receiverId} has been accepted`,
// //         userId: requesterId,
// //         type: "FRIEND_REQUEST",
// //         data: { requestId: request.id },
// //       },
// //     });
// //     return { request, notification };
// //   });
// // };

// // const sendInvite = async (
// //   activityName: string,
// //   senderId: string,
// //   receiverId: string,
// //   activityId: string
// // ) => {
// //   const result = await prisma.$transaction(async (tx: any) => {
// //     const invitation = await tx.activityInvitation.create({
// //       data: {
// //         activityId: activityId,
// //         senderId: senderId,
// //         receiverId: receiverId,
// //       },
// //     });
// //     const notification = await tx.notification.create({
// //       data: {
// //         title: "Invitation",
// //         content: `You have been invited to join ${activityName}`,
// //         userId: receiverId,
// //         type: "ACTIVITY_INVITATION",
// //         data: { activityId: activityId },
// //       },
// //     });
// //     return { invitation, notification };
// //   });
// //   return result;
// // };

// // const acceptInvite = async (
// //   activityName: string,
// //   senderId: string,
// //   receiverId: string,
// //   activityId: string
// // ) => {
// //   //receiverID is me
// //   const result = await prisma.$transaction(async (tx: any) => {
// //     const invitation = await tx.activityInvitation.update({
// //       where: {
// //         activityId_receiverId: {
// //           activityId: activityId,
// //           receiverId: receiverId,
// //         },
// //         status: "PENDING",
// //       },
// //       data: { status: "ACCEPTED" },
// //     });
// //     const member = await tx.activityMember.create({
// //       data: {
// //         activityId: activityId,
// //         userId: receiverId,
// //         joinedAt: new Date(),
// //       },
// //     });
// //     const notification = await tx.notification.create({
// //       data: {
// //         title: "Invitation",
// //         content: `${receiverId} has joined the activity ${activityName}`,
// //         userId: senderId,
// //         type: "ACTIVITY_INVITATION",
// //         data: { activityId: activityId },
// //       },
// //     });
// //     return { invitation, notification };
// //   });
// //   return result;
// // };

// // const createProgress = async (
// //   completedValue: number,
// //   taskId: string,
// //   userId: string, //req.user.id
// //   note?: string
// // ) => {
// //   const today = new Date();
// //   today.setHours(0, 0, 0, 0);

// //   const progress = await prisma.$transaction(async (tx: any) => {
// //     const task = await tx.activityTask.findUniqueOrThrow({
// //       where: { id: taskId },
// //     });

// //     const targetValue = Number(task.targetValue);

// //     const taskProgress = await tx.taskProgress.upsert({
// //       where: {
// //         taskId_userId_date: { taskId: taskId, userId: userId, date: today },
// //       },

// //       create: {
// //         taskId: taskId,
// //         userId: userId,
// //         date: today,
// //         activityId: task.activityId,
// //         completedValue: completedValue,
// //         targetSnapshot: targetValue,
// //         isCompleted: completedValue >= targetValue,
// //       },
// //       update: {
// //         activityId: task.activityId,
// //         completedValue: { increment: completedValue },
// //         updatedAt: new Date(),
// //       },
// //     });

// //     const newTotal = Number(taskProgress.completedValue);
// //     const isCompleted = newTotal >= Number(task.targetValue);
// //     if (isCompleted) {
// //       await tx.taskProgress.update({
// //         where: { id: taskProgress.id },
// //         data: { isCompleted: true },
// //       });
// //     }

// //     const entry = await tx.taskProgressEntry.create({
// //       data: {
// //         progressId: taskProgress.id,
// //         value: completedValue,
// //         note: note,
// //       },
// //     });

// //     const totalTasks = await tx.activityTask.count({
// //       where: { activityId: task.activityId },
// //     });
// //     const completedTasks = await tx.taskProgress.count({
// //       where: {
// //         activityId: task.activityId,
// //         userId: userId,
// //         date: today,
// //         isCompleted: true,
// //       },
// //     });
// //     const percentage = (completedTasks / totalTasks) * 100;

// //     await tx.activityDailyProgress.upsert({
// //       where: {
// //         activityId_userId_date: {
// //           activityId: task.activityId,
// //           userId: userId,
// //           date: today,
// //         },
// //       },
// //       create: {
// //         activityId: task.activityId,
// //         userId: userId,
// //         date: new Date(),
// //         totalTasks: totalTasks,
// //         completionPercentage: percentage,
// //         completed: completedTasks >= totalTasks,
// //       },
// //       update: {
// //         totalTasks: totalTasks,
// //         completionPercentage: percentage,
// //         completed: completedTasks >= totalTasks,
// //         date: new Date(),
// //       },
// //     });

// //     return { taskProgress, entry };
// //   });

// //   return progress;
// // };

// // const viewTaskProgress = async (userId: string, taskId: string) => {
// //   //req.user.id--> my id
// //   const progress = await prisma.taskProgress.findMany({
// //     where: { taskId: taskId, userId: userId },
// //     include: { entries: true },
// //   });
// //   return progress;
// // };

// // const getTodaysTasks = async () => {
// //   const days = [
// //     DayOfWeek.SUNDAY,
// //     DayOfWeek.MONDAY,
// //     DayOfWeek.TUESDAY,
// //     DayOfWeek.WEDNESDAY,
// //     DayOfWeek.THURSDAY,
// //     DayOfWeek.FRIDAY,
// //     DayOfWeek.SATURDAY,
// //   ];
// //   const today = new Date();
// //   const dayName = days[today.getDay()]!;
// //   const tasks = await prisma.activityTask.findMany({
// //     where: { schedules: { some: { day: dayName } } },
// //     include: { schedules: true },
// //   });

// //   return tasks;
// // };

// // const dailyProgressAnalytics = async (activityId: string, userId: string) => {
// //   const progressAnalytics = await prisma.activityDailyProgress.findMany({
// //     where: { activityId: activityId, userId: userId },
// //   });

// //   return progressAnalytics;
// // };


// export const sendFriendRequest = catchAsync(
//   async (req: Request, res: Response) => {
//     const senderId = req.user.userId;
//     const receiverId = req.params.id;

//     if (!receiverId) {
//       throw new AppError(400, "Receiver ID is required");
//     }

//     if (senderId === receiverId) {
//       throw new AppError(400, "You cannot send a friend request to yourself");
//     }

//     const result = await userService.sendFriendRequest(
//       senderId,
//       receiverId as string
//     );

//     res.status(200).json({
//       success: true,
//       message: "Friend request sent successfully",
//       data: result,
//     });
//   }
// );

// export const acceptFriendRequest = catchAsync(
//   async (req: Request, res: Response) => {
//     const requesterId = req.params.id;
//     const receiverId = req.user.userId;

//     if (!requesterId) {
//       throw new AppError(400, "Requester ID is required");
//     }

//     const result = await userService.acceptFriendRequest(
//       requesterId as string,
//       receiverId
//     );

//     res.status(200).json({
//       success: true,
//       message: "Friend request accepted successfully",
//       data: result,
//     });
//   }
// );



// export const getFriendRequests = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user.userId;
//     const { status } = req.query;

//     const requests = await userService.getFriendRequests(
//       userId,
//       (status as string) || "PENDING"
//     );

//     res.status(200).json({
//       success: true,
//       data: requests,
//       count: requests.length,
//     });
//   }
// );

// export const getFriendsList = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user.userId;

//     const friends = await userService.getFriendList(userId);

//     res.status(200).json({
//       success: true,
//       data: friends,
//       count: friends.length,
//     });
//   }
// );

// // ============= ACTIVITY INVITATIONS =============

// export const sendInvite = catchAsync(async (req: Request, res: Response) => {
//   const { activityId, receiverId,activityName } = req.body;
//   const senderId = req.user.userId;

//   if (!activityId || !receiverId) {
//     throw new AppError(400, "Activity ID and Receiver ID are required");
//   }

//   const result = await userService.sendInvite(
//     activityName,
//     activityId,
//     senderId,
//     receiverId
//   );

//   res.status(200).json({
//     success: true,
//     message: "Invitation sent successfully",
//     data: result,
//   });
// });

// export const acceptInvite = catchAsync(async (req: Request, res: Response) => {
//   const { senderId,activityId,activityName } = req.params;
//   const receiverId = req.user.userId;

//   if (!senderId) {
//     throw new AppError(400, "Invitation ID is required");
//   }

//   const result = await userService.acceptInvite(activityName as string,senderId as string,receiverId,activityId as string);

//   res.status(200).json({
//     success: true,
//     message: "Invitation accepted successfully",
//     data: result,
//   });
// });

// // export const rejectInvite = catchAsync(async (req: Request, res: Response) => {
// //   const { invitationId } = req.params;
// //   const receiverId = req.user.userId;

// //   if (!invitationId) {
// //     throw new AppError(400, "Invitation ID is required");
// //   }

// //   const result = await userService.rejectInvite(invitationId, receiverId);

// //   res.status(200).json({
// //     success: true,
// //     message: "Invitation rejected",
// //     data: result,
// //   });
// // });

// export const getUserInvitations = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user.userId;
//     const { status } = req.query;

//     const invitations = await userService.getUserInvitations(
//       userId,
//       (status as string) || "PENDING"
//     );

//     res.status(200).json({
//       success: true,
//       data: invitations,
//       count: invitations.length,
//     });
//   }
// );

// // ============= ACTIVITY PROGRESS =============

// export const createProgress = catchAsync(
//   async (req: Request, res: Response) => {
//     const { taskId, completedValue, note } = req.body;
//     const userId = req.user.userId;

//     if (!taskId || completedValue === undefined) {
//       throw new AppError(400, "Task ID and completed value are required");
//     }

//     if (completedValue < 0) {
//       throw new AppError(400, "Completed value cannot be negative");
//     }

//     const result = await userService.createProgress(
//       completedValue,
//       taskId,
//       userId,
//       note
//     );

//     res.status(200).json({
//       success: true,
//       message: "Progress updated successfully",
//       data: result,
//     });
//   }
// );

// export const viewTaskProgress = catchAsync(
//   async (req: Request, res: Response) => {
//     const { taskId } = req.params;
//     const userId = req.user.userId;

//     if (!taskId) {
//       throw new AppError(400, "Task ID is required");
//     }

//     const progress = await userService.viewTaskProgress(userId, taskId as string);

//     res.status(200).json({
//       success: true,
//       data: progress,
//       count: progress.length,
//     });
//   }
// );

// export const getTodaysTasks = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user.userId;

//     const tasks = await userService.getTodaysTasks(userId);

//     res.status(200).json({
//       success: true,
//       data: tasks,
//       count: tasks.length,
//       date: new Date().toISOString().split("T")[0],
//     });
//   }
// );

// // export const getWeeklyTasks = catchAsync(
// //   async (req: Request, res: Response) => {
// //     const userId = req.user.userId;
// //     const { weekOffset } = req.query;

// //     const tasks = await userService.getWeeklyTasks(
// //       userId,
// //       weekOffset ? Number(weekOffset) : 0
// //     );

// //     res.status(200).json({
// //       success: true,
// //       data: tasks,
// //       week: new Date().toISOString().split("T")[0],
// //     });
// //   }
// // );

// // ============= DAILY PROGRESS ANALYTICS =============

// export const dailyProgressAnalytics = catchAsync(
//   async (req: Request, res: Response) => {
//     const { activityId } = req.params;
//     const userId = req.user.userId;

//     if (!activityId) {
//       throw new AppError(400, "Activity ID is required");
//     }
    

//     const analytics = await userService.dailyProgressAnalytics(
//       activityId as string,
//       userId
//     );

//     res.status(200).json({
//       success: true,
//       data: analytics,
//       count: analytics.length,
//     });
//   }
// );

// // export const getActivityProgressSummary = catchAsync(
// //   async (req: Request, res: Response) => {
// //     const { activityId } = req.params;
// //     const userId = req.user.userId;
// //     const { startDate, endDate } = req.query;

// //     if (!activityId) {
// //       throw new AppError(400, "Activity ID is required");
// //     }

// //     const summary = await userService.getActivityProgressSummary(
// //       activityId,
// //       userId,
// //       startDate as string,
// //       endDate as string
// //     );

// //     res.status(200).json({
// //       success: true,
// //       data: summary,
// //     });
// //   }
// // );

// // ============= ACTIVITY MEMBERS =============



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
// }

import { Request, Response } from "express";
import { catchAsync } from "../../shared/cathAsync";
import AppError from "../../errorHelpers/AppError";
import { userService } from "./users.service";


const sendFriendRequest = catchAsync(
  async (req: Request, res: Response) => {
    const senderId = req.user.userId;
    const receiverId = req.params.id;

    if (!receiverId) {
      throw new AppError(400, "Receiver ID is required");
    }

    if (senderId === receiverId) {
      throw new AppError(400, "You cannot send a friend request to yourself");
    }

    const result = await userService.sendFriendRequest(
      senderId,
      receiverId as string
    );

    res.status(200).json({
      success: true,
      message: "Friend request sent successfully",
      data: result,
    });
  }
);

const acceptFriendRequest = catchAsync(
  async (req: Request, res: Response) => {
    const receiverId = req.user.userId;
    const requesterId = req.params.id;

    if (!requesterId) {
      throw new AppError(400, "Requester ID is required");
    }

    const result = await userService.acceptFriendRequest(
      requesterId as string,
      receiverId
    );

    res.status(200).json({
      success: true,
      message: "Friend request accepted successfully",
      data: result,
    });
  }
);

 const sendInvite = catchAsync(
  async (req: Request, res: Response) => {
    const senderId = req.user.userId;
    const { activityId, receiverId, activityName } = req.body;

    if (!activityId || !receiverId || !activityName) {
      throw new AppError(400, "Activity ID, receiver ID, and activity name are required");
    }

    const result = await userService.sendInvite(
      activityName,
      senderId,
      receiverId,
      activityId
    );

    res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
      data: result,
    });
  }
);

 const acceptInvite = catchAsync(
  async (req: Request, res: Response) => {
    console.log("I HAVE REACHED HERE WHICH IS ACCEPT INVITE")
    const receiverId = req.user.userId;
    const {id, activityId, senderId, activityName } = req.body;
    console.log(req.body)

    if (!activityId || !senderId || !activityName) {
      throw new AppError(400, "Activity ID, sender ID, and activity name are required");
    }

    const result = await userService.acceptInvite(
      id,
      activityName,
      senderId,
      receiverId,
      activityId
    );

    res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      data: result,
    });
  }
);

 const createProgress = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const { completedValue, activityId, taskId, note } = req.body;

    if (!completedValue || !activityId || !taskId) {
      throw new AppError(400, "Completed value, activity ID, and task ID are required");
    }

    const result = await userService.createProgress(
      completedValue,
      activityId,
      taskId,
      userId,
      note
    );

    console.log("THIS IS THE RESULT", result)

    res.status(200).json({
      success: true,
      message: "Progress created successfully",
      data: result,
    });
  }
);

const getDailyLeadership = catchAsync(
  async (req: Request, res: Response) => {
    const { taskId } = req.params;

    if (!taskId) {
      throw new AppError(400, "Task ID is required");
    }

    const result = await userService.getdailyLeadership(taskId as string);

    res.status(200).json({
      success: true,
      message: "Daily leadership retrieved successfully",
      data: result,
    });
  }
);

const getTaskLeadership = catchAsync(
  async (req: Request, res: Response) => {
    const { taskId } = req.params;

    console.log("I HAVE REached the task leadership and this is the id", taskId)

    if (!taskId) {
      throw new AppError(400, "Task ID is required");
    }

    const result = await userService.getTaskLeadership(taskId as string);

    console.log("I HAVE REached the task leadership and this is the result", result)

    res.status(200).json({
      success: true,
      message: "Task leadership retrieved successfully",
      data: result,
    });
  }
);

const getActivityLeadership = catchAsync(
  async (req: Request, res: Response) => {
    const { activityId } = req.params;

    if (!activityId) {
      throw new AppError(400, "Activity ID is required");
    }

    const result = await userService.getActivityLeadership(activityId as string);

    res.status(200).json({
      success: true,
      message: "Activity leadership retrieved successfully",
      data: result,
    });
  }
);

const viewTaskProgress = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const { taskId } = req.params;

    if (!taskId) {
      throw new AppError(400, "Task ID is required");
    }

    const result = await userService.viewTaskProgress(userId, taskId as string);

    res.status(200).json({
      success: true,
      message: "Task progress retrieved successfully",
      data: result,
    });
  }
);

const getTodaysTasks = catchAsync(
  async (req: Request, res: Response) => {
    const { activityId } = req.params;

    if (!activityId) {
      throw new AppError(400, "Activity ID is required");
    }

    const result = await userService.getTodaysTasks(activityId as string);

    res.status(200).json({
      success: true,
      message: "Today's tasks retrieved successfully",
      data: result,
    });
  }
);

const dailyProgressAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const { activityId } = req.params;

    if (!activityId) {
      throw new AppError(400, "Activity ID is required");
    }

    const result = await userService.dailyProgressAnalytics(activityId as string, userId);

    res.status(200).json({
      success: true,
      message: "Daily progress analytics retrieved successfullyyyyyyy",
      data: result,
    });
  }
);

const getFriendRequests = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const { status } = req.query;

    const result = await userService.getFriendRequests(
      userId,
      status as string | undefined
    );

    res.status(200).json({
      success: true,
      message: "Friend requests retrieved successfully",
      data: result,
    });
  }
);

const getFriendList = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.userId;

    const result = await userService.getFriendList(userId);

    res.status(200).json({
      success: true,
      message: "Friend list retrieved successfully",
      data: result,
    });
  }
);

const getUserInvitations = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const { status } = req.query;

    const result = await userService.getUserInvitations(
      userId,
      status as string | undefined
    );

    res.status(200).json({
      success: true,
      message: "User invitations retrieved successfully",
      data: result,
    });
  }
);
const getInvites = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const { activityId } = req.params;

    const result = await userService.getInvites(
      activityId as string,
      userId
    );

    res.status(200).json({
      success: true,
      message: "User invitations retrieved successfully",
      data: result,
    });
  }
);

const getUserWithUsername = catchAsync(
  async (req: Request, res: Response) => {
    const { search } = req.query;
    const userId = req.user.userId;

    if (!search || typeof(search) !== "string") {
      throw new AppError(400, "Username is required");
    }

    const result = await userService.getUserWithUsername(search as string,userId);

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
  }
);

const isTaskCompleted = catchAsync(
  async (req: Request, res: Response) => {
    const { activityId } = req.params;
    const userId = req.user.userId;

    if (!activityId) {
      throw new AppError(400, "Task ID is required");
    }

    const result = await userService.isTaskCompleted(activityId as string, userId);

    res.status(200).json({
      success: true,
      message: "Task completion status retrieved successfully",
      data: result,
    });
  }
)


export const UserController = {
  getUserWithUsername,
  getDailyLeadership,
  createProgress,
  sendInvite,
  sendFriendRequest,
  acceptFriendRequest,
  acceptInvite,
  getTaskLeadership,
  getActivityLeadership,
  viewTaskProgress,
  getTodaysTasks,
  dailyProgressAnalytics,
  getFriendRequests,
  getFriendList,
  getUserInvitations,
  isTaskCompleted,
  getInvites
}