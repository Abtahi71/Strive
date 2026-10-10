import z, { success } from "zod"
import status from "http-status"
import type { TErrorResponse, TErrorSources } from "../interfaces/errorInterface.js"

export const handleZodError = (error:z.ZodError):TErrorResponse =>{
    const errorSources:TErrorSources[]  =[]
    const message:string = "Validation Error"
    const statusCode:number = status.BAD_REQUEST

    error.issues.forEach((issue)=>{
        errorSources.push({
            path:issue.path.join("=>"),
            message:issue.message
        })
    })

    return {
        success:false,
        message,
        statusCode,
        errorSources
    }

}