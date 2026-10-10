import type { Request, Response, NextFunction } from "express";
import status from "http-status";

import { WebsiteUsageServices } from "./usage.services.js";

const startUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domain, startedAt } = req.body;

    if (!domain) {
      return res.status(status.BAD_REQUEST).json({
        success: false,
        message: "Domain is required",
      });
    }

    const usage = await WebsiteUsageServices.startUsage({
      userId: req.user!.userId,
      sessionId: (req as any).sessionId,
      domain,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
    });

    res.status(status.CREATED).json({
      success: true,
      message: "Website tracking started",
      data: usage,
    });
  } catch (error) {
    next(error);
  }
};

const stopUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { usageId, endedAt } = req.body;

    if (!usageId) {
      return res.status(status.BAD_REQUEST).json({
        success: false,
        message: "Usage ID is required",
      });
    }

    const usage = await WebsiteUsageServices.stopUsage({
      userId: req.user!.userId,
      usageId,
      endedAt: endedAt ? new Date(endedAt) : new Date(),
    });

    res.status(status.OK).json({
      success: true,
      message: "Website tracking stopped",
      data: usage,
    });
  } catch (error) {
    next(error);
  }
};

const getTodayUsage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("I AM IN GET TODAY USAGE");
  try {
    console.log("I AM IN GET TODAY USAGE2")
    const usage = await WebsiteUsageServices.getTodayUsage(req.user!.userId);

    res.status(status.OK).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    next(error);
  }
};

const getWebsiteSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await WebsiteUsageServices.getWebsiteSummary(req.user!.userId);

    res.status(status.OK).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentSession = async (req: Request, res: Response) => {
  console.log("CURRENT user", req.user.userId);
  console.log("CURRENT session", (req as any).sessionId);
  res.status(200).json({
    success: true,
    data: {
      userId: req.user!.userId,
      sessionId: (req as any).sessionId,
    },
  });
};

export const WebsiteUsageControllers = {
  startUsage,
  stopUsage,
  getTodayUsage,
  getWebsiteSummary,
  getCurrentSession,
};
