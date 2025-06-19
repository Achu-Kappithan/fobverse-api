import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name)

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx =host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request  =ctx.getRequest<Request>()

        const  status = exception instanceof HttpException 
                        ? exception.getStatus() 
                        : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorResponse = exception instanceof HttpException
                        ?(exception.getResponse()as Record<string,any>)
                        : {message: 'Internal server error' , statusCode: HttpStatus.INTERNAL_SERVER_ERROR }

        const logMessage =`
            [${request.method} ${request.url}]
            Status: ${status}
            Error: ${JSON.stringify(errorResponse)}
            User Agent: ${request.headers['user-agent'] || 'N/A'}
            IP: ${request.ip || 'N/A'}
            Timestamp: ${new Date().toISOString()}
            Stack: ${exception instanceof Error ? exception.stack : 'N/A'}
            `
            if(status >= 500) {
                this.logger.error(logMessage, exception instanceof Error ? exception.stack :"")
            }else{
                this.logger.warn(logMessage);
            }

        const responsePayload =  {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: (errorResponse.message || 'Internal Server Error').split(', '), 
            error: typeof errorResponse === 'object' && 'error' in errorResponse ? errorResponse.error : HttpStatus[status],
            details: errorResponse.message instanceof Array ? errorResponse.message : undefined 
        }

        if(Array.isArray(responsePayload.message)){
            responsePayload.message = responsePayload.message.join(', ');
        }else if (typeof responsePayload.message == 'string') {

        }else {
            responsePayload.message = 'An unexpected error occurred'
        }
        response.status(status).json(responsePayload)
    }
}