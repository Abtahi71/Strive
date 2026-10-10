import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import type z from "zod";

export const validateRequest = (zodSchema:z.ZodObject)=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        const parsedResult = zodSchema.safeParse(req.body);
        if(!parsedResult.success){
            return res.status(status.BAD_REQUEST).json(parsedResult.error)
        }
        req.body = parsedResult.data
        next()
    }
}