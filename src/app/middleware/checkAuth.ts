import type { NextFunction, Request, Response } from "express";
import type { GlobalRole } from "../../../prisma/generated/prisma/enums.js";
import AppError from "../errorHelpers/AppError.js";
import status from "http-status";
import { CookieUtils } from "../utils/cookie.js";
import { jwtUtils } from "../utils/jwt.js";

export const checkAuth = (...authRoles:GlobalRole[]) =>async(req:Request,res:Response,next:NextFunction)=>{
    try{
        //console.log(req)
        
        const accessToken = CookieUtils.getCookie(req,'accessToken')
        //console.log("THIS IS THE ACCESSTOKEN",accessToken)

        if(!accessToken){
            throw new AppError(status.UNAUTHORIZED,'Access token undefinedd')
        }

        const verifiedToken = jwtUtils.verifyToken(accessToken,process.env.ACCESS_SECRET!)

        if(!verifiedToken.success){
            throw new AppError(status.UNAUTHORIZED,'You are not logged in or your access token is invalid')
        }
        const payload = verifiedToken.data!

        req.user  ={
            userId:payload.userId,
            role:payload.role as GlobalRole,
            email:payload.email
        }

        if(authRoles.length > 0 && !authRoles.includes(payload.role as GlobalRole)){
            throw new AppError(status.FORBIDDEN,'You are not authorized to access this route')
        }
        next()

    }catch(err:any){
        console.log("========== CHECK AUTH ==========");
         console.log("ERROR:", err);
         console.log("ERROR NAME:", err.name);
         console.log("ERROR MESSAGE:", err.message);
         console.log("INSTANCEOF AppError:", err instanceof AppError);
         console.log("STATUSCODE:", (err as AppError).statuscode);
        console.log("METHOD:", req.method);

        console.log("ORIGINAL URL:", req.originalUrl);
        console.log("PATH:", req.path);
        console.log("PARAMS:", req.params);
        console.log("COOKIE:", req.headers.cookie);
        console.log("================================");
        next(err)
    }
}
export const optionalAuth = (...authRoles:GlobalRole[]) =>async(req:Request,res:Response,next:NextFunction)=>{
    try{
        //console.log(req)
        console.log("========== CHECK AUTH ==========");
        console.log("METHOD:", req.method);
        console.log("(or)ORIGINAL URL:", req.originalUrl);
        console.log("(or)PATH:", req.path);
        console.log("PARAMS:", req.params);
        console.log("COOKIE:", req.headers.cookie);
        console.log("================================");
        const accessToken = CookieUtils.getCookie(req,'accessToken')
        //console.log("THIS IS THE ACCESSTOKEN",accessToken)

        if(!accessToken){
            console.log("NO ACCESSTOKEN")
            return next()
        }

        const verifiedToken = jwtUtils.verifyToken(accessToken,process.env.ACCESS_SECRET!)

        if(!verifiedToken.success){
          throw new AppError(
          status.UNAUTHORIZED,
          "You are not logged in or your access token is invalid in optional Auth"
        );
        }
        const payload = verifiedToken.data!

        req.user  ={
            userId:payload.userId,
            role:payload.role as GlobalRole,
            email:payload.email
        }

        if(authRoles.length > 0 && !authRoles.includes(payload.role as GlobalRole)){
            throw new AppError(status.FORBIDDEN,'You are not authorized to access this route')
        }
        next()

    }catch(err:any){
        console.log("========== CHECK AUTH ==========");
        console.log("METHOD:", req.method);
        console.log("(or)ORIGINAL URL:", req.originalUrl);
        console.log("(or)PATH:", req.path);
        console.log("PARAMS:", req.params);
        console.log("COOKIE:", req.headers.cookie);
        console.log("================================");
        console.log(err.message)
        next(err)
    }
}