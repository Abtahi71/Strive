import { beforeEach, describe, expect, it, vi } from "vitest";


// Create a mock that can be accessed by Vitest's module mock.
const mocks = vi.hoisted(() => ({
  prisma: {
    activity: {
      findUnique: vi.fn(),
    },
    taskProgress: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock Prisma before importing the service.
vi.mock("../../lib/prisma.js", () => ({
  prisma: mocks.prisma,
}));

import { activityService } from "./activites.service";

const result ={
    id: "act-1",
    name: "Morning Run",
    description: "Daily cardio",
    imageUrl: "img.png",
    createdAt: new Date("2025-01-01"),
    memberCount: 10,
    taskCount: 2,
    visibility: "PUBLIC",
    creator: {
      id: "creator-1",
      name: "Alice",
      username: "alice",
      avatar: "a.png",
    },
    task: [
      {
        id: "task-1",
        name: "Run 5km",
        unit: "km",
        targetValue: 5,
        scheduleType: "DAILY",
        description: "jog",
        imageUrl: "t1.png",
        creatorId: "creator-1",
        createdAt: new Date("2025-01-01"),
        taskType: "CARDIO",
        schedules: [],
      },
      {
        id: "task-2",
        name: "Sprint",
        unit: "m",
        targetValue: 100,
        scheduleType: "DAILY",
        description: "sprint",
        imageUrl: "t2.png",
        creatorId: "creator-1",
        createdAt: new Date("2025-01-01"),
        taskType: "CARDIO",
        schedules: [],
      },
    ],
  };

describe("getActivityInfo",()=>{
  beforeEach(()=>{
    vi.clearAllMocks(), vi.spyOn(console, "log").mockImplementation(() => {});
  })

  it("returns null when activity is not found",async()=>{
    mocks.prisma.activity.findUnique.mockResolvedValue(null);
    const res = await activityService.getActivityInfo("act-1")

    expect(res).toBe(null)
    expect(mocks.prisma.taskProgress.findUnique).not.toHaveBeenCalled()

  })

  it("return only activity if userId not provided",async()=>{
    mocks.prisma.activity.findUnique.mockResolvedValue(result);
    const res = await activityService.getActivityInfo("act-1")

    expect(res).toEqual(result)
    expect(mocks.prisma.taskProgress.findUnique).not.toHaveBeenCalled()
  })
  it("return taskProgress along with activity if userId provided",async()=>{
    mocks.prisma.activity.findUnique.mockResolvedValue(result);
    
    mocks.prisma.taskProgress
      .findUnique
      .mockResolvedValueOnce({ isCompleted: true, completedValue: 5 })
      .mockResolvedValueOnce({ isCompleted: false, completedValue: 10 });

    const res = await activityService.getActivityInfo("act-1","user-1");




    expect(mocks.prisma.taskProgress.findUnique).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: {
          taskId_userId_date: expect.objectContaining({
            taskId: "task-1",
            userId: "user-1",
          }),
        },
      })
    );

    expect(mocks.prisma.taskProgress.findUnique).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: {
          taskId_userId_date: expect.objectContaining({
            taskId: "task-2",
            userId: "user-1",
          }),
        },
      })
    );
    expect(mocks.prisma.taskProgress.findUnique).toHaveBeenCalledTimes(2);
    expect(res).toEqual({
      ...result,
      task: [
        {
          ...result.task[0],
          isCompleted: true,
          completedValue: 5,
        },
        {
          ...result.task[1],
          isCompleted: false,
          completedValue: 10,
        },
      ],
    })
    
  })
})
