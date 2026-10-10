import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

interface StartUsagePayload {
  userId: string;
  sessionId: string;
  domain: string;
  startedAt?: Date;
}

interface StopUsagePayload {
  userId: string;
  usageId: string;
  endedAt?: Date;
}


const startUsage = async (payload: StartUsagePayload) => {
  const startedAt = payload.startedAt ?? new Date();

  const usage = await prisma.websiteUsage.create({
    data: {
      userId: payload.userId,
      sessionId: payload.sessionId,
      domain: payload.domain,
      startedAt,
      endedAt: null,
      durationSec: 0,
    },
  });

  return usage;
};
const stopUsage = async( payload: StopUsagePayload)=>{
    const usage = await prisma.websiteUsage.findFirst({
        where:{
            id:payload.usageId,
            userId:payload.userId,
            endedAt:null
        }
    })

    if(!usage){
        throw new AppError(404,"Usage not found")
    }

    const endedAt = payload.endedAt ?? new Date();

    const durationSec = Math.max(0, endedAt.getTime() - usage.startedAt.getTime()) / 1000;

    const updpatedUsage = await prisma.websiteUsage.update({
        where:{
            id:usage.id
        },
        data:{
            endedAt,
            durationSec
        }
    })
    return updpatedUsage;
}


const getTodayUsage = async (userId: string) => {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const usage = await prisma.websiteUsage.groupBy({
    by: ["domain"],
    where: {
      userId,
      startedAt: {
        gte: startOfDay,
      },
    },
    _sum: {
      durationSec: true,
    },
    orderBy: {
      _sum: {
        durationSec: "desc",
      },
    },
    
  });

  const usage3 = await prisma.websiteUsage.findMany({
    where: {
      userId,
    },
    orderBy: {
      startedAt: "desc",
    },
    take: 10,
  });

  //console.log("ALL USER USAGE:", usage3);

  return usage.map((item) => ({
    domain: item.domain,
    durationSec: item._sum.durationSec,
  }));
};

const getWebsiteSummary = async (userId: string) => {
  const usage = await prisma.websiteUsage.groupBy({
    by: ["domain"],
    where: {
      userId,
    },
    _sum: {
      durationSec: true,
    },
    orderBy: {
      _sum: {
        durationSec: "desc",
      },
    },
  });

  return usage;
};

export const WebsiteUsageServices = {
  startUsage,
  stopUsage,
  getTodayUsage,
  getWebsiteSummary,
};