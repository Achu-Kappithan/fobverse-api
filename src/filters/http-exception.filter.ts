
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { ErrorApiResponse } from "src/shared/responses/api.response"; 

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let frontendMessage: string; 
    let errorName: string;
    let details: any = {}; 

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        frontendMessage = exceptionResponse;
        errorName = exception.name;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as { message?: string | string[]; error?: string; statusCode?: number; [key: string]: any; };

        if (Array.isArray(responseObj.message)) {
          frontendMessage = responseObj.message.join('; '); 
          details.validationErrors = responseObj.message;
        } else {
          frontendMessage = responseObj.message || 'An unexpected error occurred.';
        }

        errorName = responseObj.error || exception.name;

        const { message, error, statusCode: _, ...restDetails } = responseObj;
        Object.assign(details, restDetails); 
      } else {
        frontendMessage = `HTTP Error ${status}`;
        errorName = exception.name;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      frontendMessage = 'An internal server error occurred.';
      errorName = 'InternalServerError';
      if (exception instanceof Error) {
        details.originalErrorMessage = exception.message;
      }
    }

    if (status === HttpStatus.UNAUTHORIZED) {
      frontendMessage = 'Authentication required or invalid credentials.';
    } else if (status === HttpStatus.FORBIDDEN) {
      frontendMessage = 'You do not have permission to access this resource.';
    } else if (status === HttpStatus.NOT_FOUND) {
      frontendMessage = 'The requested resource was not found.';
    } else if (status === HttpStatus.CONFLICT) {
      frontendMessage = 'Resource already exists or a conflict occurred.';
    } else if (status === HttpStatus.BAD_REQUEST && frontendMessage === 'An unexpected error occurred.') {
      frontendMessage = 'Invalid request parameters.';
    }

    const logMessage = `
        [${request.method} ${request.url}]
        Status: ${status}
        Frontend Message: "${frontendMessage}"
        Error Name: "${errorName}"
        Original Exception: ${exception instanceof Error ? exception.message : JSON.stringify(exception)}
        Details: ${JSON.stringify(details)}
        User Agent: ${request.headers['user-agent'] || 'N/A'}
        IP: ${request.ip || 'N/A'}
        Timestamp: ${new Date().toISOString()}
        Stack: ${exception instanceof Error ? exception.stack : 'N/A'}
    `;

    if (status >= 500) {
      this.logger.error(logMessage);
    } else {
      this.logger.warn(logMessage);
    }

    const responsePayload: ErrorApiResponse = {
      success: false,
      statusCode: status,
      message: frontendMessage,
      error: errorName,
      path: request.url,
    };

    if (Object.keys(details).length > 0) {
      responsePayload.details = details;
    }

    response.status(status).json(responsePayload);
  }
}