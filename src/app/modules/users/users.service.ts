


import { Prisma } from "../../../../prisma/generated/prisma/client.js"
import { ActivityRole, DayOfWeek, FriendshipStatus } from "../../../../prisma/generated/prisma/enums.js"
import AppError from "../../errorHelpers/AppError"
import { prisma } from "../../lib/prisma.js"



    

    
const sendFriendRequest = async(senderId:string,receiverId:string)=>{
    const result = await prisma.$transaction(async(tx:any) =>{
        const existing = await tx.friendship.findFirst({
          where: {
            OR: [
              {
                requesterId: senderId,
                receiverId,
              },
              {
                requesterId: receiverId,
                receiverId: senderId,
              },
            ],
          },
        });

        if (existing) {
          throw new AppError(
            400,
            "A friendship or friend request already exists"
          );
        }
        const request = await tx.friendship.create({
            data:{
                requesterId:senderId,
                receiverId:receiverId,
                status:"PENDING"
            }
        })
        const notification = await tx.notification.create({
            data:{
                title:"Friend Request",
                content:`You have a friend request from ${senderId}`,
                userId:receiverId,
                type:"FRIEND_REQUEST",
                data:{requestId:request.id},
                createdAt:new Date()
            }
        })
        return {request,notification}
    })
}

const acceptFriendRequest= async(requesterId:string,receiverId:string)=>{
    //receiverID is me
    const result = await prisma.$transaction(async(tx:any) =>{
        const request = await tx.friendship.findUnique({
            where:{requesterId_receiverId:{requesterId:requesterId,receiverId:receiverId}},
            //data:{status:"ACCEPTED"}
        })
            if (!request) {
              throw new AppError(404, "Friend request not found");
            }

            if (request.status !== "PENDING") {
              throw new AppError(400, "Friend request is not pending");
            }
        const updatedRequest = await tx.friendship.update({
          where: {
            requesterId_receiverId: {
              requesterId,
              receiverId,
            },
          },
          data: {
            status: "ACCEPTED",
          },
        });
        const notification = await tx.notification.create({
            data:{
                title:"Friend Request",
                content:`Your friend request to ${receiverId} has been accepted`,
                userId:requesterId,
                type:"FRIEND_REQUEST",
                data:{requestId:request.id},
                createdAt:new Date()
            }
        })
        return {request,notification}
    })
}

const sendInvite = async(activityName:string,senderId:string,receiverId:string,activityId:string)=>{
    //senderId is req.user.userId

    const sender = await prisma.activity.findUnique({
        where:{id:activityId},
        select:{creatorId:true}
    })

    if(!sender ||(sender?.creatorId !== senderId)){
        throw new AppError(
          403,
          "You are not authorized to send invites for this activity"
        );
    }
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const result = await prisma.$transaction(async(tx:any) =>{
        const invitation = await tx.activityInvitation.create({
            data:{
                activityId:activityId,
                senderId:senderId,
                receiverId:receiverId,
                expiresAt:expiresAt
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

const acceptInvite = async(id:string,activityName:string,senderId:string,receiverId:string,activityId:string)=>{
    //receiverID is me
    console.log("I AM IN SERVICE")
    const result = await prisma.$transaction(async(tx:any) =>{
        const invitation = await tx.activityInvitation.update({
            where:{id:id},
            data:{acceptedAt:new Date()}
        })

        console.log("invitation",invitation)

        const member = await tx.activityMember.create({
            data:{
                activityId:activityId,
                userId:receiverId,
                joinedAt:new Date(),
                role:ActivityRole.MEMBER,
                //createdAt:new Date()
            }
        })
        const notification = await tx.notification.create({
            data:{
                title:"Invitation",
                content:`${receiverId} has joined the activity ${activityName}`,
                userId:senderId,
                type:"ACTIVITY_INVITATION",
                data:{activityId:activityId},
                createdAt:new Date()
            }
        })
        return {invitation,notification}
    })
    return result
}

const getInvites = async(activityId:string,userId:string)=>{
    const result = await prisma.activityInvitation.findMany({
        where:{senderId:userId},
        select:{id:true,receiverId:true,activityId:true,expiresAt:true},
       // include:{activity:true}
    })
    return result
}

const createProgress = async (
        completedValue: number,
        activityId: string,
        taskId: string,
        userId:string, //req.user.id
        note?: string) => {


        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const acheivements = await prisma.taskAchievement.findMany({
            where:{taskId:taskId},
            select:{
                id:true,
                totalValue:true,
                unit:true,
                iconType:true,
                iconValue:true
            },
            orderBy:{totalValue:"asc"}
        })
        

        const totalAchievements:any = []
        const streakAchievements:any = []

        for (let i = 0; i < acheivements.length; i++) {
            totalAchievements.push(acheivements[i].totalValue) //10 pushups, 20 pushups, 30 pushups
        }
        

        const progress = await prisma.$transaction(async (tx:Prisma.TransactionClient) => {
                const task  = await tx.activityTask.findUniqueOrThrow({where: {id: taskId}})

                const targetValue = Number(task.targetValue) 

                const todayProgress = await tx.taskProgress.findUnique({
                    where: {taskId_userId_date: { taskId: taskId, userId: userId, date: today }},
                    select:{completedValue:true, isCompleted:true}
                })

                const wasCompletedToday = todayProgress?.isCompleted??false

                const yesterdayProgress = await tx.taskProgress.findUnique({
                    where: {taskId_userId_date: { taskId: taskId, userId: userId, date: yesterday }},
                    select:{completedValue:true, isCompleted:true,currentStreak: true}
                })

                

                const progress = await tx.taskProgress.upsert({
                    where: {taskId_userId_date: { taskId: taskId, userId: userId, date: today }},

                    create: {
                        taskId: taskId,
                        userId: userId,
                        date: today,
                        activityId: task.activityId,
                        completedValue: completedValue,
                        targetSnapshot: targetValue,
                        isCompleted: completedValue >= targetValue,
                    },
                    update: {
                        activityId: task.activityId,
                        completedValue: {increment: completedValue},
                        updatedAt: new Date(),
                    },
                });

                const totalCompletedResult = await tx.taskProgress.aggregate({  //lifetime total for achievement calculation
                    where:{userId:userId,taskId:taskId},
                    _sum:{completedValue:true}
                })

                const totalCompleted = Number(totalCompletedResult._sum.completedValue) || 0

                const achieved:any = []

                for (let i = 0; i < acheivements.length; i++) {
                    if(totalCompleted >= totalAchievements[i]){
                        const existingAchievement =
                              await tx.userTaskAchievement.findUnique({
                                where: {
                                  userId_achievementId: {
                                    userId,
                                    achievementId: acheivements[i].id,
                                  },
                                },
                                select: {
                                  isEarned: true,
                                },
                              });

                        if(existingAchievement?.isEarned)continue;
                        await tx.userTaskAchievement.upsert({
                            where: {
                                userId_achievementId: {
                                    userId,
                                    achievementId: acheivements[i].id
                                }
                            },
                            update: {
                                isEarned: true,
                                completedValue: Number(totalCompleted)
                            },
                            create: {
                                user: {
                                    connect: {
                                        id: userId
                                    }
                                },
                                achievement: {
                                    connect: {
                                        id: acheivements[i].id
                                    }
                                },
                                isEarned: true,
                                completedValue: Number(totalCompleted)
                            }
                        });
                        achieved.push({id:acheivements[i].id,totalValue:acheivements[i].totalValue,unit:acheivements[i].unit,iconType:acheivements[i].iconType,iconValue:acheivements[i].iconValue})
                    }else break
                }



                const newTotal = Number(progress.completedValue)  //today's total done by me
                const isCompleted = newTotal >= Number(task.targetValue)  //today's task completed or not


                if(isCompleted && !wasCompletedToday){
                  const newStreak = yesterdayProgress?.isCompleted
                    ? (yesterdayProgress.currentStreak ??0)+1
                    : 1;

                  await tx.taskProgress.update({
                    where: { id: progress.id },
                    data: {
                      isCompleted: true,
                      currentStreak: newStreak,
                    },
                  });
              }

                
                
                const completed = await tx.taskProgress.count({ //total how many completed all over
                    where:{userId:userId,taskId:taskId},
                    select:{isCompleted:true}
                })

                const entry = await tx.taskProgressEntry.create({
                    data: {
                        progressId: progress.id,
                        value: completedValue,
                        note: note,
                    },
                });

                const totalTasks = await tx.activityTask.count({
                    where:{activityId:task.activityId}
                })
                const completedTasks = await tx.taskProgress.count({
                    where:{activityId:task.activityId,userId:userId,date:today,isCompleted:true}
                })
                const percentage = (completedTasks/totalTasks)*100

                  const todayDailyProgress =
                    await tx.activityDailyProgress.findUnique({
                      where: {
                        activityId_userId_date: {
                          activityId: task.activityId,
                          userId,
                          date: today,
                        },
                      },
                      select: {
                        completed: true,
                      },
                    });

                  const wasActivityCompletedToday =
                    todayDailyProgress?.completed ?? false;

                if(percentage>=100 && !wasActivityCompletedToday){

                  const previousDay = await tx.activityDailyProgress.findUnique(
                    {
                      where: {
                        activityId_userId_date: {
                          activityId: task.activityId,
                          userId,
                          date: yesterday,
                        },
                      },
                      select: {
                        completed: true,
                      },
                    }
                  );

                  const member = await tx.activityMember.findUniqueOrThrow({
                    where: {
                      activityId_userId: {
                        activityId: task.activityId,
                        userId,
                      },
                    },
                    select: {
                      currentStreak: true,
                      longestStreak: true,
                    },
                  });


                  const newStreak = previousDay?.completed
                    ? member.currentStreak + 1
                    : 1;

                  await tx.activityMember.update({
                    where: {
                      activityId_userId: {
                        activityId: task.activityId,
                        userId,
                      },
                    },
                    data: {
                      currentStreak: newStreak,
                      longestStreak: Math.max(member.longestStreak, newStreak),
                    },
                  });


                    
                }
                await tx.activityDailyProgress.upsert({
                    where:{activityId_userId_date:{activityId:task.activityId,userId:userId,date:today}},
                        create:{
                            activityId:task.activityId,
                            userId:userId,
                            date:today,
                            totalTasks:totalTasks,
                            completionPercentage:percentage,
                            completed:completedTasks>=totalTasks,
                            completedTasks:completedTasks
                        },
                        update:{
                            totalTasks:totalTasks,
                            completionPercentage:percentage,
                            completed:completedTasks>=totalTasks,
                            completedTasks:completedTasks,
                            
                        }
                    })
                
                return {progress, entry, achieved};
        });
        return progress
};


const isTaskCompleted = async (activityId: string,userId:string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks = await prisma.activityTask.findMany({
    where: { activityId: activityId },
    select: { id: true },
  });
  const taskIds = tasks.map((task) => task.id);

  let progress:any = []

  for (let i = 0; i < taskIds.length; i++) {
    const task = await prisma.taskProgress.findUnique({
      where: { taskId_userId_date: { taskId: taskIds[i], userId: userId, date: today } },
      select: { id: true, isCompleted: true, completedValue: true },
    });
    progress.push(task)
  }
  return progress;
};

const getdailyLeadership = async(taskId:string)=>{
    const today = new Date()
    today.setHours(0,0,0,0)

    const leaderShip = await prisma.taskProgress.findMany({
      where: { taskId: taskId, date: today },
      select: {
        completedValue: true,
        userId:true,
        isCompleted:true,
        user: {
          select: {
            username: true,
            createdAt: true,
            // achievements: {
            //   select: {
            //     id: true,
            //     completedValue: true,
            //     achievement: {
            //       select: {
            //         title: true,
            //         description: true,
            //         totalValue: true,
            //         unit: true,
            //       },
            //     },
            //   },
            // },
          },
        },
      },
      orderBy: { completedValue: "desc" },
    });
    return leaderShip
}
const getTaskLeadership = async(taskId:string)=>{
    

    const progress = await prisma.taskProgress.groupBy({
      by: ["userId"],      
      where: { taskId },
      _sum:{
        completedValue:true
      },
      orderBy:{
        _sum:{
            completedValue:"desc"
        }
      } 
    });
    
    const userIds = progress.map((item)=>item.userId)

    const users = await prisma.user.findMany({
        where:{id:{in:userIds}},
        select:{id:true,username:true,createdAt:true}

    })
    const userMap = new Map(users.map((user)=>[user.id,user]))

    return progress.map((item)=>({
        userId:item.userId,
        username:userMap.get(item.userId)?.username,
        createdAt:userMap.get(item.userId)?.createdAt,
        completedValue:item._sum.completedValue??0
    }))
}


const getActivityLeadership = async (activityId: string) => {
  const progress = await prisma.activityDailyProgress.findMany({
    where: {
      activityId,
    },
    select: {
      userId: true,
      completedTasks: true,
      totalTasks: true,
      user: {
        select: {
          username: true,
          createdAt: true,
        },
      },
    },
  });

  const aggregated = Object.values(
    progress.reduce((acc, row) => {
      if (!acc[row.userId]) {
        acc[row.userId] = {
          userId: row.userId,
          username: row.user.username,
          createdAt: row.user.createdAt,
          completedTasks: 0,
          totalTasks: 0,
        };
      }

      acc[row.userId].completedTasks += row.completedTasks;
      acc[row.userId].totalTasks += row.totalTasks;

      return acc;
    }, {} as Record<string, {
      userId: string;
      username: string;
      createdAt: Date;
      completedTasks: number;
      totalTasks: number;
    }>)
  );

  return aggregated
    .map((user) => ({
      ...user,
      completionPercentage:
        user.totalTasks > 0
          ? (user.completedTasks)
          : 0,
    }))
    .sort(
      (a, b) => b.completionPercentage - a.completionPercentage
    );
};


const viewTaskProgress = async(userId:string,taskId:string)=>{ //req.user.id--> my id
    const progress = await prisma.taskProgress.findMany({
        where:{taskId:taskId,userId:userId},
        include:{entries:{
          orderBy:{
            createdAt:"desc"
          }
        }},
        orderBy:{createdAt:"desc"}
    })
    return progress
}

const getTodaysTasks = async(activityId:string)=>{
    const days = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY
    ];
    const today = new Date();
    const dayName = days[today.getDay()]!;
    const tasks = await prisma.activityTask.findMany({
        where:{activityId:activityId,schedules:{some:{day:dayName}}},
        include:{schedules:true,activity:true}
    })

    return tasks
}

const dailyProgressAnalytics = async (activityId: string, userId: string) => {
  const hasAccess = await prisma.activityMember.findFirst({
    where: { activityId: activityId, userId: userId },
  });
  if (!hasAccess) {
    throw new AppError(403, "You don't have access to this activity");
  }

  const [ownProgressAnalytics, membersProgressAnalytics] = await Promise.all([
    // Your own progress history
    prisma.activityDailyProgress.findMany({
      where: {
        activityId,
        userId,
      },
      orderBy: {
        date: "asc",
      },
    }),

    // All other members' progress histories
    prisma.activityDailyProgress.findMany({
      where: {
        activityId,
        userId: { not: userId },
      },
      include:{
        user:{
          select:{name:true,username:true,id:true}
        }
      },
      orderBy: [{ userId: "asc" }, { date: "asc" }],
    }),
  ]);

const groupedMembersProgress = membersProgressAnalytics.reduce<
  Record<
    string,
    {
      username: string | null;
      progress: typeof membersProgressAnalytics;
    }
  >
>((groups, record) => {
  const { userId, user } = record;

  if (!groups[userId]) {
    groups[userId] = {
      username: user.name,
      progress: [],
    };
  }

  groups[userId].progress.push(record);

  return groups;
}, {});

  return {
    ownProgressAnalytics,
    membersProgressAnalytics:groupedMembersProgress,
  };
};


const getFriendRequests = async(userId:string,status?:string)=>{
    let fstatus
    if(status){
        fstatus = status==="PENDING"?FriendshipStatus.PENDING:FriendshipStatus.ACCEPTED
    }
    const requests = await prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: status ? fstatus : FriendshipStatus.PENDING,
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return requests
}

const getFriendList = async(userId:string)=>{
    const friends = await prisma.friendship.findMany({
      where: {
        //status: FriendshipStatus.ACCEPTED,
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      select: {
        id:true,
        requesterId: true,
        receiverId: true,
        status: true,
        requester: {
          select: {
            id: true,
            username: true,
            createdAt: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            createdAt: true,
          },
        },
      },
    });
    return friends.map((friend)=>{
        const user = friend.requesterId===userId?friend.receiver:friend.requester

        return {
            friendId:friend.id,
            userid:user.id,
            username:user.username,
            createdAt:user.createdAt,
            status:friend.status
        }
    })
}

const getUserInvitations = async(userId:string,status?:string)=>{
  const now = new Date();

  console.log("SERVER NOW:", now);
    const invites = await prisma.activityInvitation.findMany({
        where:{receiverId:userId,expiresAt:{gt:new Date()}},
        select:{
            id:true,
            activityId:true,
            senderId:true,
            acceptedAt:true,
            activity:{
                select:{id:true,name:true,description:true}
            },
            createdAt:true,
            sender:{
                select:{
                    id:true,
                    name:true,
                    username:true,
                    avatar:true,
                    email:true,
                    activity:{
                        select:{activityId:true}
                    }
                }
            }
        }
    })

    const invitations = await Promise.all(
        invites.map(async(invitation)=>{
            const member = await prisma.activityMember.findFirst({
                where:{activityId:invitation.activityId,userId:userId},select:{id:true}
            })
          return {
            ...invitation,
            member:member?true:false,
          };
        })
    )
    return {
      invitations
    }
}

const getUserWithUsername = async(search:string,userId:string)=>{
    
    const user = await prisma.user.findMany({
        where:{
            OR:[
                {
                    username:{
                        startsWith:search,
                        mode:"insensitive"
                    },
                },
                {
                    email:{
                        startsWith:search,
                        mode:"insensitive"
                    },
                }
            ]
    },
    select:{
            id:true,
            username:true,
            avatar:true,
            email:true,
            activity:{
                select:{
                    activityId:true
                }
            }
        },
        take:5
    })
    const friends = await prisma.friendship.findMany({
        where:{
            OR:[
                {
                    requesterId:userId
                },
                {
                    receiverId:userId
                }
            ]
        },
        select:{
            requesterId:true,
            receiverId:true,
            status:true
        }

    })
    return {user,friends}
}



export const userService = {
    getUserWithUsername,
    getTodaysTasks,
    dailyProgressAnalytics,
    getdailyLeadership,
    getTaskLeadership,
    getActivityLeadership,
    sendInvite,
    sendFriendRequest,
    acceptFriendRequest,
    acceptInvite,
    createProgress,
    viewTaskProgress,
    getFriendRequests,
    getFriendList,
    getUserInvitations,
    isTaskCompleted,
    getInvites
}