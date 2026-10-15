import AppError from "../../errorHelpers/AppError.js"
import { prisma } from "../../lib/prisma.js"
import bcrypt from "bcrypt"
import { jwtUtils } from "../../utils/jwt.js"
import { tokenUtils } from "../../utils/token.js"
import { sessionUtils } from "../../utils/session.js"
import status from "http-status"
import { googleClient } from "../../config/google.js"
import crypto from "crypto";

const register = async(payload:any)=>{
    const existingUser = await prisma.user.findFirst({where:{OR:[{email:payload.email},{username:payload.email}]}})

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let username,email

    if(emailRegex.test(payload.email)){
      username = payload.email.split("@")[0];
      email = payload.email
    }else{
      username = payload.email
    }

    if(existingUser){
        throw new AppError(400,"User already exists")
    }

    const hashedPassword = await bcrypt.hash(payload.password,10)

    const user = await prisma.user.create({
        data:{
            username,
            email,
            password:hashedPassword
        }
    })

    const {password, ...userWithoutPassword} = user

    const accessToken = tokenUtils.getAccessToken({
      userId: user.id,
      role: user.globalRole,
      email: user.email,
    });

    const sessionToken = await sessionUtils.createSession(user.id);

    return { user: userWithoutPassword, accessToken, sessionToken };

    
}

const login = async(payload:any)=>{
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: payload.email }, { username: payload.email }] },
    });

    if(!user){
        throw new AppError(400,"User does not exist")
    }

    const isPasswordCorrect = await bcrypt.compare(payload.password,user.password!)

    if(!isPasswordCorrect){
        throw new AppError(400,"Incorrect password")
    }

    const accessToken = tokenUtils.getAccessToken({
            userId:user.id,
            role:user.globalRole,
            email:user.email
    })

    const sessionToken = await sessionUtils.createSession(user.id)

    const {password, ...userWithoutPassword} = user
    return {user:userWithoutPassword,accessToken,sessionToken}
}

const refreshAccessToken = async(sessionToken:string | undefined)=>{
    if(!sessionToken){
        throw new AppError(400,"No session found, Please login again")
    }
    
    const result = await sessionUtils.validateSession(sessionToken)

    if(!result){
        throw new AppError(400,"No session found, Please login again")
    }
    
    const {session,newToken} = result
    const {user} = session

    const accessToken = tokenUtils.getAccessToken({
        userId:user.id,
        role:user.globalRole,
        email:user.email
    })

    return {accessToken,newToken}
}

const logOut = async(sessionToken:string)=>{
    await sessionUtils.revokeSession(sessionToken)
}
const logOutAllDevices = async(userId:string)=>{
    await sessionUtils.revokeAllSessions(userId)
}

const getMe = async (userId: string, activityId?: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user ) {
    throw new AppError(status.NOT_FOUND, "User not found.");
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};


const googleLogin = async (code: string) => {
  const { tokens } = await googleClient.getToken(code);

  if (!tokens.id_token) {
    throw new AppError(400, "Google authentication failed");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new AppError(400, "Invalid Google account");
  }

  const { sub: googleId, email, name, picture, email_verified } = payload;

  if (!email || !email_verified || !googleId) {
    throw new AppError(400, "Unable to verify Google account");
  }

  let user = await prisma.user.findUnique({
    where: {
      googleId,
    },
  });

  // Google account doesn't exist yet
  if (!user) {
    // Check whether this email already belongs to an account
    user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      // Existing normal account → link Google to it
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          googleId,
          avatar: user.avatar ?? picture ?? null,
        },
      });
    } else {
      // Completely new user
      let username = email.split("@")[0];

      // username must be unique
      const existingUsername = await prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (existingUsername) {
        username = `${username}_${Date.now()}`;
      }

      user = await prisma.user.create({
        data: {
          name: name ?? username,
          username,
          email,
          googleId,
          avatar: picture ?? null,
          password: null,
        },
      });
    }
  }

  if (!user.isActive) {
    throw new AppError(403, "Your account is inactive");
  }

  // Create your normal application access token
  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
  };
};


const changePassword = async(payload:any,userId:string)=>{   
    const user = await prisma.user.findUnique({where:{id:userId}})

    if(!user){
        throw new AppError(400,"User does not exist")
    }

    const isPasswordCorrect = await bcrypt.compare(payload.oldPassword,user.password!)

    if(!isPasswordCorrect){
        throw new AppError(400,"Incorrect password")
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword,10)

    const updatedUser = await prisma.user.update({
        where:{id:userId},
        data:{password:hashedPassword}
    })

    await sessionUtils.revokeAllSessions(userId)

}


const hashGoogleLoginCode = (code: string) =>
  crypto.createHash("sha256").update(code).digest("hex");

// Create a temporary code valid for 2 minutes.
const createGoogleLoginCode = async (userId: string) => {
  const code = crypto.randomBytes(32).toString("hex");
  const codeHash = hashGoogleLoginCode(code);

  await prisma.googleLoginCode.create({
    data: {
      codeHash,
      userId,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    },
  });

  return code;
};

// Exchange a code for normal Strive authentication tokens.
const exchangeGoogleLoginCode = async (code: string) => {
  const codeHash = hashGoogleLoginCode(code);

  const user = await prisma.$transaction(async (tx) => {
    const loginCode = await tx.googleLoginCode.findUnique({
      where: { codeHash },
    });

    if (!loginCode || loginCode.expiresAt <= new Date()) {
      throw new AppError(401, "Invalid or expired Google login code");
    }

    // Only one concurrent request can successfully consume this code.
    const consumed = await tx.googleLoginCode.deleteMany({
      where: {
        id: loginCode.id,
        codeHash,
        expiresAt: { gt: new Date() },
      },
    });

    if (consumed.count !== 1) {
      throw new AppError(401, "Google login code has already been used");
    }

    const foundUser = await tx.user.findUnique({
      where: { id: loginCode.userId },
    });

    if (!foundUser || !foundUser.isActive) {
      throw new AppError(401, "Google login is unavailable for this account");
    }

    return foundUser;
  });

  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.globalRole,
    email: user.email,
  });

  const sessionToken = await sessionUtils.createSession(user.id);

  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    sessionToken,
  };
};

export const AuthServices = {googleLogin,register,login,refreshAccessToken,logOut,logOutAllDevices,getMe,changePassword,createGoogleLoginCode,exchangeGoogleLoginCode};
