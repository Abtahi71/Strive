import type { Request, Response, NextFunction } from "express";
import status from "http-status";

import { CookieUtils } from "../../utils/cookie.js";
import { tokenUtils } from "../../utils/token.js";
import { AuthServices } from "./auth.services.js";
import { jwtUtils } from "../../utils/jwt.js";
import AppError from "../../errorHelpers/AppError.js";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, accessToken, sessionToken } = await AuthServices.register(
      req.body
    );

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setSessionTokenCookie(res, sessionToken);

    res.status(status.CREATED).json({
      success: true,
      message: "User registered successfully.",
      data: user,
      token: accessToken,
      sessionToken,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, accessToken, sessionToken } = await AuthServices.login(
      req.body
    );

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setSessionTokenCookie(res, sessionToken);

    res.status(status.OK).json({
      success: true,
      message: "Logged in very successfully.",
      data: user,
      token: accessToken,
      sessionToken,
    });
  } catch (err) {
    next(err);
  }
};

const verifyToken = async(req:Request,res:Response)=>{
  const accessToken = CookieUtils.getCookie(req,'accessToken')
  const verifiedToken = jwtUtils.verifyToken(accessToken,process.env.ACCESS_SECRET!)

  if(!verifiedToken.success){
    return res.status(status.UNAUTHORIZED).json({success:false,message:"You are not logged in"})
  }

  return res.status(status.OK).json({success:true,data:verifiedToken.data})
  
}

const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("REEEEEEFFFFFFREEEEESSSHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH")
    const sessionToken = CookieUtils.getCookie(req, "sessionToken");
    const { accessToken , newToken} = await AuthServices.refreshAccessToken(sessionToken);

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setSessionTokenCookie(res, newToken);

    res.status(status.OK).json({
      success: true,
      message: "Access token refreshed.",
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = CookieUtils.getCookie(req, "sessionToken");
    await AuthServices.logOut(sessionToken);

    CookieUtils.clearCookie(res, "accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    CookieUtils.clearCookie(res, "sessionToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.status(status.OK).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    next(err);
  }
};

const logoutAllDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await AuthServices.logOutAllDevices(req.user!.userId);

    CookieUtils.clearCookie(res, "accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    CookieUtils.clearCookie(res, "sessionToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.status(status.OK).json({
      success: true,
      message: "Logged out from all devices.",
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("I am in getMe")
    const { id } = req.query

    if(!req.user?.userId){
      return res.status(200).json({success:true,data:null})
    }

    let activityId

    if(id){
      const activityId = id as string
    }
    const user = await AuthServices.getMe(req.user!.userId, activityId);


    res.status(status.OK).json({
      success: true,
      message: "User fetched successfully.",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    await AuthServices.changePassword(
      req.body,
      req.user!.userId,
      
    );

    // Every session including this one is now revoked — force fresh login
    CookieUtils.clearCookie(res, "accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    CookieUtils.clearCookie(res, "sessionToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.status(status.OK).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (err) {
    next(err);
  }
};




const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
      );
    }

    const {user} = await AuthServices.googleLogin(code);

    const loginCode = await AuthServices.createGoogleLoginCode(user.id);

    return res.redirect(
      `${
        process.env.FRONTEND_URL
      }/api/auth/google/callback?code=${encodeURIComponent(loginCode)}`
    );


  } catch (err) {
    next(err);
  }
};

const exchangeGoogleLoginCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.body;

    if (typeof code !== "string" || !code) {
      throw new AppError(400, "Google login code is required");
    }

    const { user, accessToken, sessionToken } =
      await AuthServices.exchangeGoogleLoginCode(code);

    // Return tokens to the trusted Next.js server route.
    // Do not set cookies on the Render response.
    return res.status(status.OK).json({
      success: true,
      message: "Google login successful",
      data: user,
      token: accessToken,
      sessionToken,
    });
  } catch (err) {
    return next(err);
  }
};

export const AuthControllers = {
  register,
  login,
  refresh,
  logout,
  logoutAllDevices,
  getMe,
  changePassword,
  verifyToken,
  googleLogin,
  exchangeGoogleLoginCode
};
