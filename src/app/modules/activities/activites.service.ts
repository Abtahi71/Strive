import { ActivityRole, Visibility } from "../../../../prisma/generated/prisma/enums.js"
import { prisma } from "../../lib/prisma.js"

    
const createActivity = async(activityPayload:any,taskPayload:any, creatorId:string)=>{
    const {name,description,imageUrl,visibility} = activityPayload
    const {unit,targetValue,scheduleType,taskName,taskDescription,taskImage,days} = taskPayload
    let vis:any
    if(visibility == "PUBLIC"){
        vis = Visibility.PUBLIC
    }else if(visibility == "PRIVATE"){
        vis = Visibility.INVITE_ONLY
    }

    
    const result = await prisma.$transaction(async(tx:any) =>{

        console.log("tx.activity",tx.activity)
        const activity = await tx.activity.create({
            data:{
            name:name,
            description:description,
            imageUrl:imageUrl,
            creatorId:creatorId,
            visibility:vis,
            memberCount:1,
            taskCount:1
        }
        })

        console.log("tx.conversation",tx.conversation)
        const convo =await tx.conversationGroup.create({
            data:{
                activityId:activity.id
            }
        })
        console.log("tx.activityTask",tx.activityTask)
        const activityTask = await tx.activityTask.create({
            data:{
                activityId:activity.id,
                unit:unit,
                targetValue:targetValue,
                scheduleType:scheduleType,
                name:taskName,
                description:taskDescription,
                imageUrl:taskImage,
                creatorId:creatorId
            }
        })
        console.log("tx.activityMember",tx.activityMember)
        const member = await tx.activityMember.create({
            data:{
                activityId:activity.id,
                userId:creatorId,
                role: ActivityRole.ADMIN,
                joinedAt:new Date()
            }
        })

        if(days.length > 0){
            for (let i = 0; i < days.length; i++) {
                await tx.taskSchedule.create({
                    data:{
                        taskId:activityTask.id,
                        day:days[i]
                    }
                })  
            }
        }
        return {activity,activityTask}  
    })
    return result
}

const createTask = async(activityId:string,taskPayload:any,creatorId:string)=>{
    const {unit,targetValue,scheduleType,taskName,taskDescription,taskImage,days} = taskPayload
    const result = await prisma.$transaction(async(tx:any) =>{
        const activityTask = await tx.activityTask.create({
            data:{
                activityId:activityId,
                unit:unit,
                targetValue:targetValue,
                scheduleType:scheduleType,
                name:taskName,
                description:taskDescription,
                imageUrl:taskImage,
                creatorId:creatorId
            }
        })

        await prisma.activity.update({
            where:{id:activityId},
            data:{taskCount:{increment:1}}
        })

        

        if(days.length > 0){
            for (let i = 0; i < days.length; i++) {
                await tx.taskSchedule.create({
                    data:{
                        taskId:activityTask.id,
                        day:days[i]
                    }
                })  
            }
        }
        return {activityTask}  
    })
    return result
}

const getMyActivity = async(userId:string)=>{
    const result = await prisma.activityMember.findMany({
        where:{userId:userId},
        include:{activity:true}
    })
    return result
}
const getMyCreatedActivity = async(userId:string)=>{
    const result = await prisma.activityMember.findMany({
        where:{userId:userId,role:ActivityRole.ADMIN},
        include:{activity:true}
    })
    return result
}

const getPublicActivites = async()=>{
    const result = await prisma.activity.findMany({
        where:{visibility:"PUBLIC"}
    })
    return result
}

const joinActivity = async(activityId:string,userId:string)=>{
    const activity = await prisma.activity.findUnique({
        where:{id:activityId}
    })
    if (!activity || activity.visibility === Visibility.INVITE_ONLY) {
        throw new Error("Activity not found")
    }
    const result = await prisma.activityMember.create({
        data:{
            activityId:activityId,
            userId:userId,
            role:ActivityRole.MEMBER,
            joinedAt:new Date()
        }
    })
    return result
}

const leaveActivity = async(activityId:string,userId:string)=>{
    const result = await prisma.activityMember.update({
        where:{activityId_userId:{activityId:activityId,userId:userId}},
        data:{leftAt:new Date()}
    })
    return result
}

const getActivityMembers = async(activityId:string)=>{

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const result = await prisma.activityMember.findMany({
        where:{activityId:activityId},
        include:{user:true}
    })

    await Promise.all(result.map(async(member) => {
        const isDone = await prisma.activityDailyProgress.findUnique({
          where: {
            activityId_userId_date: {
              activityId: activityId,
              userId: member.userId,
              date: yesterday,
            },
            completed:true
          },
        })
        if(!isDone){
            await prisma.activityMember.update({
                where:{activityId_userId:{activityId:activityId,userId:member.userId}},
                data:{
                  currentStreak:0,
                  longestStreak:member.currentStreak>member.longestStreak?member.currentStreak:member.longestStreak
                }
            })
        }
      }))

      return await prisma.activityMember.findMany({
        where:{activityId:activityId},
        include:{user:true}
    })
  
    // return result
}


const sendInvite = async(activityName:string,senderId:string,receiverId:string,activityId:string)=>{
    
    const result = await prisma.$transaction(async(tx:any) =>{
        const invitation = await tx.activityInvitation.create({
            data:{
                activityId:activityId,
                senderId:senderId,
                receiverId:receiverId
            }
        })
        const notification = await tx.notification.create({
            data:{
                title:"Invitation",
                content:`You have been invited to join ${activityName}`,
                userId:receiverId,
                type:"ACTIVITY_INVITATION",
                data:{activityId:activityId},
                createdAt:new Date()
            }
        })
        return {invitation,notification}
    })
    return result
}

const getActivityInfo = async (activityId: string, userId?: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  console.log("I am 1")

  const result = await prisma.activity.findUnique({
    where: {
      id: activityId,
    },
    select: {
      creator: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },

      task: {
        select: {
          id: true,
          unit: true,
          targetValue: true,
          scheduleType: true,
          name: true,
          description: true,
          imageUrl: true,
          creatorId: true,
          createdAt: true,
          taskType: true,
          schedules: true,
        },
      },

      id: true,
      memberCount: true,
      taskCount: true,
      visibility: true,
      name: true,
      description: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  console.log("I am 2")

  if (!result) {
    return null;
  }

  console.log("I am 3")

  let tasks = null

  if(!userId){
    return {...result}
  }

  console.log("I am 4")

  tasks = await Promise.all(
    result.task.map(async (task) => {
      const progress = await prisma.taskProgress.findUnique({
        where: {
          taskId_userId_date: {
            taskId: task.id,
            userId: userId,
            date: today,
          },
        },
        select: {
          isCompleted: true,
          completedValue: true,
        },
      });

      return {
        ...task,
        isCompleted: progress?.isCompleted ?? false,
        completedValue: progress?.completedValue ?? 0,
      };
    })
  );

  console.log("I am 5")

  return {
    ...result,
    task: tasks,
  };
};




const messages = async (
  conversationGroupId: string,
) => {
  const result = await prisma.message.findMany({
    where: { conversationGroupId },
    select:{
        id:true,
        senderId:true,
        content:true,
        createdAt:true
    }
  });
  return result;
};

const totalCompletedTask = async (userId: string) => {
      const now = new Date();

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      );

      console.log("THIS IS THE START OF MONTH", startOfMonth);
      console.log("THIS IS THE START OF NEXT MONTH", startOfNextMonth);

    const result = await prisma.taskProgress.groupBy({
      by: ["date"],
      _count: {
        taskId: true,
      },
      where: {
        userId: userId,
        isCompleted: true,
        date: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      orderBy: {
        date: "asc",
      },
    });
    const result2 = result.map((item) => {
        return {
        date: item.date,
        completedTask: item._count.taskId,
        };
    })

    console.log("THIS IS THE RESULT FROM TOTAL COMPLETED TASK",result2)
  return result2;
};

const getAllActivities = async () => {
  const result = await prisma.activity.findMany({
    where:{
      visibility:Visibility.PUBLIC
    },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      createdAt: true,

    },
  });
  return result;
};

const getSchedules = async (taskId: string) => {
  const result = await prisma.taskSchedule.findMany({
    where: {
      taskId: taskId,
    },
    select: {
      day: true,
    },
  });
  return result;
};



export const activityService = {
    getActivityInfo,
    createActivity,
    createTask,
    getMyActivity,
    getPublicActivites,
    joinActivity,
    leaveActivity,
    getActivityMembers,
    sendInvite,
    getMyCreatedActivity,
    messages,
    totalCompletedTask,
    getAllActivities,
    getSchedules
}