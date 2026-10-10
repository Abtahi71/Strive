export interface TErrorResponse{
    success:boolean
    message:string
    statusCode:number
    errorSources:TErrorSources[]
    error?:unknown
    stack?:string
}

export interface TErrorSources{
    path:string
    message:string
}