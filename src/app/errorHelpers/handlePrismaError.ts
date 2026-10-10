import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import status from "http-status";
import type { PrismaClientInitializationError, PrismaClientValidationError } from "../../../prisma/generated/prisma/internal/prismaNamespace.js";

const getStatusCodeFromPrismaError = (errorCode: string): number => {
  //P2002: Unique constraint failed
  if (errorCode === "P2002") {
    return status.CONFLICT;
  }

  // P2025, P2001, P2015, P2018 : Not Found errors
  if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) {
    return status.NOT_FOUND;
  }

  // P1000 , P6002 : DB Authentication errors = 401 Unauthorized
  if (["P1000", "P6002"].includes(errorCode)) {
    return status.UNAUTHORIZED;
  }

  // P1010 , P6010 : Access denied errors = 403 Forbidden
  if (["P1010", "P6010"].includes(errorCode)) {
    return status.FORBIDDEN;
  }

  // P6003 : Prisma Accelararate Plan limit exceeded = 402 Payment Required
  if (errorCode === "P6003") {
    return status.PAYMENT_REQUIRED;
  }

  // P1008, 2004, 6004 : Timeout errors = 504 Gateway Timeout
  if (["P1008", "P2004", "P6004"].includes(errorCode)) {
    return status.GATEWAY_TIMEOUT;
  }

  // P5011 : Rate Limit Exceeded = 429 Too Many Requests
  if (errorCode === "P5011") {
    return status.TOO_MANY_REQUESTS;
  }

  // P6009 Response size limit exceeded = 413 Payload Too Large
  if (errorCode === "P6009") {
    return 413;
  }

  // P1xxx , P2024, P2037, P6008 : Connection errors
  if (
    errorCode.startsWith("P1") ||
    ["P2024", "P2037", "P6008"].includes(errorCode)
  ) {
    return status.SERVICE_UNAVAILABLE;
  }

  // P2XXX : except unhandled errors, Bad Request
  if (errorCode.startsWith("P2")) {
    return status.BAD_REQUEST;
  }

  // P3XXX, P4XXX : Internal Server Errors
  if (errorCode.startsWith("P3") || errorCode.startsWith("P4")) {
    return status.INTERNAL_SERVER_ERROR;
  }

  return status.INTERNAL_SERVER_ERROR;
};


const formatErrorMeta = (meta?: Record<string, unknown>):string =>{
    if(!meta) return ""
    
    const parts:string[] = []

    if(meta.target){
       parts.push(`Field:${String(meta.target)}`)
    }
    if(meta.field_name){
       parts.push(`Field:${String(meta.field_name)}`)
    }
    if(meta.column_name){
       parts.push(`Field:${String(meta.column_name)}`)
    }
    if(meta.table){
       parts.push(`Field:${String(meta.table)}`)
    }
    if(meta.model_name){
       parts.push(`Field:${String(meta.model_name)}`)
    }
    if(meta.relation_name){
       parts.push(`Field:${String(meta.relation_name)}`)
    }
    if(meta.constraint){
       parts.push(`Field:${String(meta.constraint)}`)
    }
    if(meta.database_error){
       parts.push(`Field:${String(meta.database_error)}`)
    }

    return parts.length > 0 ? parts.join(" | ") : ""
}

export const handlePrismaClientKnownError = (error:PrismaClientKnownRequestError)=>{
     let cleanedMessage = error.message

     const statusCode = getStatusCodeFromPrismaError(error.code);
     const metaInfo = formatErrorMeta(error.meta);

     cleanedMessage = cleanedMessage.replace(
       /Invalid `.*?` invocation:?\s*/i,
       ""
     );

     const lines = cleanedMessage.split("\n").filter(
       (line) => line.trim())

    const mainMessage = lines[0] || "An error occured in the database operation"

    const errorSources = [{
        path:error.code,
        message: metaInfo? `${mainMessage} | ${metaInfo}` : mainMessage
    }]

    if(error.meta?.cause){
        errorSources.push({
            path:"cause",
            message:String(error.meta.cause)
        })
    }

    return {
        success:false,
        message:mainMessage,
        statusCode,
        errorSources
    }
}
export const handlePrismaClientValidationError = (error:PrismaClientValidationError)=>{
    let cleanedMessage = error.message

    cleanedMessage = cleanedMessage.replace(
      /Invalid `.*?` invocation:?\s*/i,
      ""
    );

    const lines = cleanedMessage.split('\n').filter((line)=>line.trim())

    const errorSources = []

    const fieldMatch = cleanedMessage.match(/Argument `(\w+)`/i);
    const fieldName = fieldMatch ? fieldMatch[1] : "Unknown Field";

    const mainMessage = lines.find(
      (line) => !line.includes("Argment") && !line.includes("→") && line.length > 10
    ) || lines[0] || "Invalid query operations provided to the database operation";

    errorSources.push({
        path:fieldName,
        message:mainMessage
    })

    return {
        success:false,
        message:mainMessage,
        statusCode:status.BAD_REQUEST,
        errorSources
    }
}

export const handlePrismaClientInitializationError = (error:PrismaClientInitializationError)=>{
    const statusCode = error.errorCode? getStatusCodeFromPrismaError(error.errorCode) : status.INTERNAL_SERVER_ERROR

    let cleanedMessage = error.message

    cleanedMessage = cleanedMessage.replace(
      /Invalid `.*?` invocation:?\s*/i,
      ""
    );

    const lines = cleanedMessage.split('\n').filter((line)=>line.trim())

    const mainMessage = lines[0] || "An error occured while initializing Prisma Client"

    const errorSources = [
        {
            path:error.errorCode || "Initialization Error",
            message:mainMessage
        }
    ]

    return {
        success:false,
        message:`Prisma Client Initialization Error :${mainMessage}`,
        statusCode,
        errorSources
    }
}
