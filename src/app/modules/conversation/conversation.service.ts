import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma.js";

const getConversationGroup = async (activityId: string) => {
  const conversationGroup = await prisma.conversationGroup.findUnique({
    where: {
      activityId,
    },
  });

  if (!conversationGroup) {
    throw new AppError(404, "Conversation group not found");
  }

  return conversationGroup;
};

const checkActivityMember = async (activityId: string, userId: string) => {
  const member = await prisma.activityMember.findUnique({
    where: {
      activityId_userId: {
        activityId,
        userId,
      },
    },
  });

  if (!member || !member.isActive) {
    throw new AppError(403, "You are not an active member of this activity");
  }

  return member;
};

const getMessages = async (activityId: string, userId: string) => {
  await checkActivityMember(activityId, userId);

  const conversationGroup = await getConversationGroup(activityId);

  const messages = await prisma.message.findMany({
    where: {
      conversationGroupId: conversationGroup.id,
      deletedAt: null,
    },

    select: {
      id: true,
      senderId: true,
      type: true,
      content: true,
      edited: true,
      createdAt: true,

      sender: {
        select: {
          id: true,
          username: true,
        },
      },

      attachments: {
        select: {
          id: true,
          url: true,
          fileName: true,
          mimeType: true,
          size: true,
        },
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });

  return messages;
};

const sendMessage = async (
  activityId: string,
  senderId: string,
  content: string
) => {
  await checkActivityMember(activityId, senderId);

  const conversationGroup = await getConversationGroup(activityId);

  if (!content || !content.trim()) {
    throw new AppError(400, "Message content cannot be empty");
  }

  const message = await prisma.message.create({
    data: {
      conversationGroupId: conversationGroup.id,

      senderId,

      type: "TEXT",

      content: content.trim(),
    },

    select: {
      id: true,
      senderId: true,
      type: true,
      content: true,
      edited: true,
      createdAt: true,

      sender: {
        select: {
          id: true,
          username: true,
        },
      },

      attachments: true,
    },
  });

  return message;
};

const editMessage = async (
  messageId: string,
  userId: string,
  content: string
) => {
  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },
  });

  if (!message) {
    throw new AppError(404, "Message not found");
  }

  if (message.senderId !== userId) {
    throw new AppError(403, "You can only edit your own messages");
  }

  if (!content.trim()) {
    throw new AppError(400, "Message content cannot be empty");
  }

  return prisma.message.update({
    where: {
      id: messageId,
    },

    data: {
      content: content.trim(),
      edited: true,
    },

    select: {
      id: true,
      senderId: true,
      content: true,
      edited: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const deleteMessage = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },
  });

  if (!message) {
    throw new AppError(404, "Message not found");
  }

  if (message.senderId !== userId) {
    throw new AppError(403, "You can only delete your own messages");
  }

  return prisma.message.update({
    where: {
      id: messageId,
    },

    data: {
      deletedAt: new Date(),
      content: null,
    },

    select: {
      id: true,
      senderId: true,
      deletedAt: true,
    },
  });
};

export const conversationService = {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
};
