class ApiError extends Error {
    statusCode: number;
    data: any;
    message: string;
    errors: any[];
    stack: string;
    constructor(
        statusCode: number,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.errors = errors

        if (stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }