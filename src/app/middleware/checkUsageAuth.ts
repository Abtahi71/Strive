import type { NextFunction, Request, Response } from "express";
import status from "http-status";

import AppError from "../errorHelpers/AppError.js";
import { sessionUtils } from "../utils/session.js";

export const checkUsageAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("GETTING TODAY USAGE");
  try {
    const sessionToken = req.headers["x-session-token"] as string | undefined;

    console.log("SESSION TOKEN:", req.headers["x-session-token"]);

    if (!sessionToken || typeof sessionToken !== "string") {
      throw new AppError(status.UNAUTHORIZED, "Usage session token missing");
    }

    const session = await sessionUtils.getSessionByToken(sessionToken);

    if (!session) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Usage session is invalid or expired"
      );
    }

    req.user = {
      userId: session.userId,
      role: session.user.globalRole,
      email: session.user.email,
    };

    // Keep session ID available to usage controllers
    (req as any).sessionId = session.id;

    next();
  } catch (error) {
    next(error);
  }
};
