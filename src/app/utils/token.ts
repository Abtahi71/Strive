import type { Response } from "express"
import type { SignOptions } from "jsonwebtoken"
import { CookieUtils } from "./cookie.js"
import { jwtUtils } from "./jwt.js"

const isProd = process.env.NODE_ENV === 'production'

const ACCESS_TOKEN_TTL_MS = 2 * 60 * 1000; // 15 min
const SESSION_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; 

const getAccessToken = (payload:any)=>{
    const accessToken = jwtUtils.createToken(
        payload,
        process.env.ACCESS_SECRET as string,
        {expiresIn:process.env.JWT_EXPIRES_IN} as SignOptions 
    )
    return accessToken
}


const setAccessTokenCookie = (res:Response, token:string)=>{
    CookieUtils.setCookie(res,'accessToken',token,{
        httpOnly:true,
        secure:isProd,
        sameSite:isProd?'none':'lax',
        path:'/',
        maxAge:20*60*1000
    })

    console.log('cookie set')
    //console.log("this is the cookie which is set",req.cookies["accessToken"])
}

const setSessionTokenCookie = (res:Response,token:string)=>{
    CookieUtils.setCookie(res, "sessionToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 1000 * 7,
    });
}

export const tokenUtils = {getAccessToken,setAccessTokenCookie,setSessionTokenCookie}