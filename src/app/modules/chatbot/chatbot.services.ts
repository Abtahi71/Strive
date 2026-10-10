import { prisma } from "../../lib/prisma";

const EMBEDDING_URL = "https://openrouter.ai/api/v1/embeddings";

export async function createEmbedding(text: string) {
  const response = await fetch(EMBEDDING_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Embedding failed: ${error}`);
  }

  const data = await response.json();

  return data.data[0].embedding as number[];
}


export async function searchKnowledge(query:string,limit=5){
    const queryEmbedding = await createEmbedding(query);
    const vector = `[${queryEmbedding.join(",")}]`;

    const result = await prisma.$queryRawUnsafe<
    {
        id:string;
        source:string;
        content:string;
        score:number;
    }[]
    >(`
    SELECT 
    id,
    source,
    content,
    1-(embedding <=> $1::vector) AS score
    FROM knowledge_chunks
    ORDER BY embedding <=> $1::vector
    LIMIT $2
    `,
    vector,
    limit)

    return result
    

}


export async function getUserStreak(userId: string) {
  const result = await prisma.taskProgress.aggregate({
    where: {
      userId,
    },
    _max: {
      currentStreak: true,
    },
  });

  return result._max.currentStreak ?? 0;
}

export async function getActivityStreak(userId: string, activityName: string) {
  const member = await prisma.activityMember.findFirst({
    where: {
      userId,
      isActive: true,
      activity: {
        name: {
          equals: activityName,
          mode: "insensitive",
        },
      },
    },
    include: {
      activity: true,
    },
  });

  if (!member) {
    return {
      found: false,
      activityName,
    };
  }

  return {
    found: true,
    activityId: member.activityId,
    activityName: member.activity.name,
    currentStreak: member.currentStreak,
    longestStreak: member.longestStreak,
  };
}

export async function getActivityMembership(
  userId: string,
  activityName: string
) {
  const member = await prisma.activityMember.findFirst({
    where: {
      userId,
      isActive: true,
      activity: {
        name: {
          equals: activityName,
          mode: "insensitive",
        },
      },
    },
    include: {
      activity: true,
    },
  });

  if (!member) {
    return {
      found: false,
      activityName,
    };
  }

  return {
    found: true,
    activityId: member.activityId,
    activityName: member.activity.name,
    joinedAt: member.joinedAt,
    role: member.role,
    completionRate: member.completionRate,
    currentStreak: member.currentStreak,
    longestStreak: member.longestStreak,
  };
}



export async function createConversation(userId: string) {
  return prisma.chatConversation.create({
    data: {
      userId,
    },
  });
}

export async function getConversation(conversationId: string, userId: string) {
  return prisma.chatConversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });
}

export async function getConversationMessages(conversationId: string) {
  return prisma.chatMessage.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 20,
  });
}

export async function saveUserMessage(conversationId: string, content: string) {
  return prisma.chatMessage.create({
    data: {
      conversationId,
      role: "USER",
      content,
    },
  });
}

export async function saveAssistantMessage(
  conversationId: string,
  content: string | null,
  toolCalls?: unknown
) {
  return prisma.chatMessage.create({
    data: {
      conversationId,
      role: "ASSISTANT",
      content,
      toolCalls: toolCalls ?? undefined,
    },
  });
}

export async function saveToolMessage(
  conversationId: string,
  toolCallId: string,
  content: string
) {
  return prisma.chatMessage.create({
    data: {
      conversationId,
      role: "TOOL",
      toolCallId,
      content,
    },
  });
}

export function convertMessagesToLLM(dbMessages: any[]) {
  return dbMessages
    .map((message) => {
      if (message.role === "USER") {
        return {
          role: "user",
          content: message.content,
        };
      }

      if (message.role === "ASSISTANT") {
        return {
          role: "assistant",
          content: message.content,
          ...(message.toolCalls
            ? {
                tool_calls: message.toolCalls,
              }
            : {}),
        };
      }

      if (message.role === "TOOL") {
        return {
          role: "tool",
          tool_call_id: message.toolCallId,
          content: message.content,
        };
      }

      return null;
    })
    .filter(Boolean);
}