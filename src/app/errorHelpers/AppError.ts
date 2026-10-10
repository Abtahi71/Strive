class AppError extends Error{
    public statuscode:number
    constructor(statusCode:number, message:string, stack = ""){
        super(message)
        this.statuscode = statusCode

        if (stack) {
          this.stack = stack;
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export default AppError