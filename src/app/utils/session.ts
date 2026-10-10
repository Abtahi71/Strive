//import { bcrypt } from 'bcrypt';
import { prisma } from "../lib/prisma.js";
import crypto, { hash } from "crypto";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const hashToken = (token:string)=>crypto.createHash("sha256").update(token).digest("hex")


const generateSessionToken = () => {
  return crypto.randomBytes(32).toString("hex");
};


const createSession = async(userId:string)=>{
    const token  = crypto.randomBytes(40).toString("hex")
    const hashedToken = hashToken(token)
    const expiresAt = new Date(Date.now()+SESSION_TTL_MS)

    const session = await prisma.session.create({
        data:{
            refreshTokenHash:hashedToken,
            expiresAt,
            userId
        }
    })

    return token
}
const validateSession = async(token:string)=>{
    const tokenHash = hashToken(token)

    const session = await prisma.session.findFirst({
        where:{refreshTokenHash:tokenHash,expiresAt:{gt:new Date()}},
        include:{user:true}
    })  

    if(!session){
        return null
    }
    const newToken = generateSessionToken()
    const newTokenHash = hashToken(newToken)

    const newExpiresAt = new Date(Date.now()+SESSION_TTL_MS)
    const newSession = await prisma.session.update({where:{id:session.id},data:{refreshTokenHash:newTokenHash,expiresAt:newExpiresAt},include:{user:true}})
    return {session:newSession,newToken}
}

const getSessionByToken = async (token: string) => {
  console.log("========== GET SESSION BY TOKEN ==========");
  console.log("RAW TOKEN:", token);
  const tokenHash = hashToken(token);

  const session = await prisma.session.findFirst({
    where: {
      refreshTokenHash: tokenHash,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  console.log("SESSION FOUND:", session);

  return session;
};


const revokeSession = async(token:string)=>{
    const hashedToken = hashToken(token)
    await prisma.session.deleteMany({where:{refreshTokenHash:hashedToken}})
}

const revokeAllSessions = async(userId:string)=>{
    await prisma.session.deleteMany({where:{userId}})
}

export const sessionUtils = {createSession,validateSession,revokeSession,revokeAllSessions,getSessionByToken}