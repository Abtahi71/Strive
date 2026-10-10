import { ActivityRole, Visibility } from "../../../../prisma/generated/prisma/enums.js"
import { prisma } from "../../lib/prisma.js"


//model TaskAchievement{
//     id                String @id @default(uuid())
//     taskId            String
//     task              ActivityTask @relation(fields: [taskId],references: [id], onDelete: Cascade)
//     title             String
//     description       String
//     iconUrl           String
//     totalValue        Int
//     unit              String?
//     createdAt         DateTime @default(now())
//     users             UserTaskAchievement[]
// }


// model UserTaskAchievement{
//     id                String @id @default(uuid())
//     userId            String
//     achievementId     String
//     user              User @relation(fields: [userId],references: [id], onDelete: Cascade)
//     achievement       TaskAchievement @relation(fields: [achievementId],references: [id], onDelete: Cascade)
//     isEarned          Boolean
//     completedValue    Int @default(0)
//     @@unique([userId,achievementId])
//     @@index([userId])
//     @@index([achievementId])
// }

    

    

const createTaskAchievement = async(payload:any,taskId:string)=>{

  console.log("this is the payload",payload)
    const achievments = await prisma.taskAchievement.create({
        data:{
            ...payload,
            taskId
        }
    })
    return achievments
}
const getAchievement = async(taskId:string)=>{
    const achievments = await prisma.taskAchievement.findMany({
      where: { taskId: taskId },
    });
    return achievments
}
const getMyAchievements = async(userId:string)=>{
    const achievments = await prisma.userTaskAchievement.findMany({
      where: { userId: userId },
      include: {
        achievement: true,
      },

    });
    
    return achievments
}



export const achievementServices = {
  
    createTaskAchievement,
    getAchievement,
    getMyAchievements
}

