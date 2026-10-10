import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import type { TErrorSources } from "../interfaces/errorInterface.js";
import AppError from "../errorHelpers/AppError.js";
import z from "zod";
import { handleZodError } from "../errorHelpers/handleZodError.js";
import { error } from "console";

export const globalErrorHandler = (err:Error,req:Request,res:Response,next:NextFunction)=>{

      console.log("========== GLOBAL ERROR HANDLER ==========");
      console.log("ERROR:", err.message);
      console.log("IS APP ERROR:", err instanceof AppError);
      console.log(
        "STATUSCODE:",
        err instanceof AppError ? err.statuscode : "NOT APP ERROR"
      );
      console.error("Error Stack:\n", err.stack);
      console.log("THE path:", req.path);
    let statusCode:number = status.INTERNAL_SERVER_ERROR
    let message:string = "Something went wrong"
    let stack:string | undefined = ""
    let errorSources:TErrorSources[] =[]

    if(err instanceof z.ZodError){
        const zodError = handleZodError(err)
        statusCode = zodError.statusCode
        message = zodError.message
        errorSources = zodError.errorSources
    }
    else if(err instanceof AppError){
        statusCode = err.statuscode
        message = err.message
        stack = err.stack
        errorSources = [{path:"",message:err.message}]
    }
    else if(err instanceof Error){
        statusCode = status.BAD_REQUEST
        message = err.message
        stack = err.stack
        errorSources = [{path:"",message:err.message}]
    }
    

      console.log("FINAL STATUS CODE:", statusCode);
      console.log("FINAL MESSAGE:", message);
      console.log("HEADERS SENT:", res.headersSent);
    res.status(statusCode).json({ 
        success:false,
        message,
        statusCode,
        errorSources,
        error:err,
    })

}


