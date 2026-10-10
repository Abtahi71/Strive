import  express  from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes.js';
import { activityRoutes } from '../modules/activities/activities.route.js';
import { achievementRoutes } from '../modules/achievements/achievement.route.js';
import { userRoutes } from '../modules/users/users.routes.js';
import { conversationRouter } from '../modules/conversation/conversation.route.js';
import { chatbotRoutes } from '../modules/chatbot/chatbot.route.js';
import { WebsiteUsageRoutes } from '../modules/usage/usage.route.js';
const router = express.Router()

router.use('/auth',AuthRoutes)
router.use('/activity',activityRoutes)
router.use('/achievement',achievementRoutes)
router.use('/user',userRoutes)
router.use('/conversation',conversationRouter)
router.use('/chatbot',chatbotRoutes)
router.use("/usage", WebsiteUsageRoutes);

export const IndexRoutes = router