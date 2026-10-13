import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

const getAccessToken = (cookieHeader?: string) => {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  const accessTokenCookie = cookies.find((cookie) =>
    cookie.startsWith("accessToken=")
  );

  if (!accessTokenCookie) {
    return null;
  }

  return accessTokenCookie.substring("accessToken=".length);
};

export const socketAuth = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    const token = socket.handshake.auth?.token || getAccessToken(cookieHeader);

    console.log("this is the token in socket", token)

    if (!token) {
      return next(new Error("Unauthorized hehehe: no token"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET!) as JwtPayload;

    console.log("this is decoded in socket",decoded)

    if (!decoded.userId) {
      return next(new Error("Unauthorized hahaha: invalid payload"));
    }

    socket.data.userId = decoded.userId;

    next();
  } catch (error:any) {
    console.log("THIS IS ERROR MESSAGE",error.message)
    next(error.message);
  }
};
