import { beforeEach, describe, expect, it, vi } from "vitest";

// Create a mock that can be accessed by Vitest's module mock.
const mocks = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(),
    taskAchievement: {
      findMany: vi.fn(),
    },
  },
}));

// Mock Prisma before importing the service.
vi.mock("../../lib/prisma.js", () => ({
  prisma: mocks.prisma,
}));

import { userService } from "./users.service.js";

describe("createProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates today's progress when the user submits progress for the first time", async () => {
    const progressRecord = {
      id: "progress-1",
      taskId: "task-1",
      userId: "user-1",
      completedValue: 5,
      targetSnapshot: 10,
      isCompleted: false,
    };

    const tx = {
      activityTask: {
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          id: "task-1",
          activityId: "activity-1",
          targetValue: 10,
        }),
        count: vi.fn().mockResolvedValue(2),
      },

      taskProgress: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue(progressRecord),
        aggregate: vi.fn().mockResolvedValue({
          _sum: { completedValue: 5 },
        }),
        count: vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(1),
        update: vi.fn(),
      },

      taskAchievement: {
        findMany: vi.fn().mockResolvedValue([]),
      },

      userTaskAchievement: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },

      taskProgressEntry: {
        create: vi.fn().mockResolvedValue({
          id: "entry-1",
          value: 5,
        }),
      },

      activityMember: {
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
      },

      activityDailyProgress: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({}),
      },
    };

    // Execute the real transaction callback against our fake database.
    mocks.prisma.$transaction.mockImplementation(async (callback:any) =>
      callback(tx)
    );

    mocks.prisma.taskAchievement.findMany.mockResolvedValue([]);

    const result = await userService.createProgress(
      5,
      "activity-1",
      "task-1",
      "user-1",
      "Completed 5 push-ups"
    );

    // 1. The service returns the progress record.
    expect(result.progress).toEqual(progressRecord);

    // 2. A new daily record is created with the correct target.
    expect(tx.taskProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          taskId: "task-1",
          userId: "user-1",
          completedValue: 5,
          targetSnapshot: 10,
          isCompleted: false,
        }),
      })
    );

    // 3. The submission is recorded in the history.
    expect(tx.taskProgressEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          progressId: "progress-1",
          value: 5,
          note: "Completed 5 push-ups",
        }),
      })
    );

    // 4. The transaction was used.
    expect(mocks.prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
