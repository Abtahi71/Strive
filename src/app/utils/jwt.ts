import type { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const createToken = (payload:JwtPayload,secret:string,options:SignOptions) => {
  const expiresIn = options?.expiresIn?? "1d"
  const token = jwt.sign(payload,secret,{expiresIn});
  return token
};

const verifyToken = (token:string,secret:string) =>{
    try{
        const decoded = jwt.verify(token,secret) as JwtPayload
        return {
            success:true,
            data:decoded
        }
    }catch(err){
        return {
            success:false,
            message:"Invalid Token"
        }
    }
}

const decodeToken = (token:string)=>{
    try{
        const decoded = jwt.decode(token) as JwtPayload
        return {
            success:true,
            data:decoded
        }
    }catch(err){
        return {
            success:false,
            message:"Invalid Token"
        }
    }
}

export const jwtUtils = {createToken,verifyToken,decodeToken}
