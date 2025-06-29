import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessApiResponse } from '../responses/api.response'; 

interface ServiceResponsePayload<T> {
  message?: string; 
  data?: T;       
  [key: string]: any; 
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T | ServiceResponsePayload<T>, SuccessApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map(responseBody => { 
        let data: T | undefined;
        let finalMessage: string;
        const statusCode = response.statusCode || HttpStatus.OK;

        if (responseBody && typeof responseBody === 'object' && !Array.isArray(responseBody)) {
          const servicePayload = responseBody as ServiceResponsePayload<T>;

          if (servicePayload.message !== undefined) {
            finalMessage = servicePayload.message;

            if (servicePayload.data !== undefined) {
              data = servicePayload.data;
            } else {
              const { message, ...restOfPayload } = servicePayload;
              data = restOfPayload as T; 
            }
          } else {
            finalMessage = 'Operation successful';
            data = responseBody;
          }
        } else {
          finalMessage = 'Operation successful'; 
          data = responseBody;
        }

        return {
          success: true,
          statusCode: statusCode,
          message: finalMessage,
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };
      }),
    );
  }
}