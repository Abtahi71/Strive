import { getActivityMembership, getActivityStreak } from "./chatbot.services"


export const chatbotTools = [
  {
    type: "function",
    function: {
      name: "get_activity_streak",
      description:
        "Get the authenticated user's current and longest streak for a specific Strive activity. Use this when the user asks about their streak in an activity.",
      parameters: {
        type: "object",
        properties: {
          activityName: {
            type: "string",
            description:
              "The name of the Strive activity mentioned by the user, for example 'Workout'.",
          },
        },
        required: ["activityName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_activity_membership",
      description:
        "Get the authenticated user's membership information for a specific Strive activity, including when they joined, their role, completion rate, and streaks.",
      parameters: {
        type: "object",
        properties: {
          activityName: {
            type: "string",
            description:
              "The name of the Strive activity, for example 'Workout'.",
          },
        },
        required: ["activityName"],
        additionalProperties: false,
      },
    },
  },
];

export async function executeChatbotTool(
    toolName:string,
    args:any,
    userId:string
){
    switch (toolName) {
      case "get_activity_streak": {
        const result = await getActivityStreak(userId, args.activityName);
        return result;
      }
      case "get_activity_membership": {
        return getActivityMembership(userId, args.activityName);
      }
      default:
        throw new Error(`Tool not found ${toolName}`);
    }
}