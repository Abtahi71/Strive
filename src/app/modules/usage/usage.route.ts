import { Router } from "express";



import { WebsiteUsageControllers } from "./usage.controller.js";
import { checkAuth } from "../../middleware/checkAuth.js";
import { checkUsageAuth } from "../../middleware/checkUsageAuth.js";

const router = Router();

router.post("/start",checkUsageAuth, WebsiteUsageControllers.startUsage);

router.post("/stop",checkUsageAuth, WebsiteUsageControllers.stopUsage);

router.get("/today",checkAuth(), WebsiteUsageControllers.getTodayUsage);

router.get("/summary", WebsiteUsageControllers.getWebsiteSummary);

router.get("/session",checkUsageAuth, WebsiteUsageControllers.getCurrentSession);
export const WebsiteUsageRoutes = router;
