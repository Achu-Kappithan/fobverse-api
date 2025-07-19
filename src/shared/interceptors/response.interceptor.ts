// src/common/interceptors/response.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessApiResponse } from '../responses/api.response'; // Your response interface
import { classToPlain } from 'class-transformer'; // <<< IMPORT THIS!

interface ServiceResponsePayload<T> {
  message?: string;
  data?: T;
  [key: string]: any;
}

@Injectable()
export class ResponseInterceptor<T>
  implements
    NestInterceptor<T | ServiceResponsePayload<T>, SuccessApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((responseBody) => {
        let dataToTransform: any; // Use 'any' here as it could be T or ServiceResponsePayload<T>
        let finalMessage: string;
        const statusCode = response.statusCode || HttpStatus.OK;

        // Determine what part of the response needs to be transformed by classToPlain
        if (
          responseBody &&
          typeof responseBody === 'object' &&
          !Array.isArray(responseBody) &&
          (responseBody as ServiceResponsePayload<T>).message !== undefined
        ) {
          // This path handles your `comapnyResponceInterface` structure from services
          const servicePayload = responseBody as ServiceResponsePayload<T>;
          finalMessage = servicePayload.message!; // Use ! as we've checked for undefined above
          dataToTransform = servicePayload.data || servicePayload; // Take 'data' if present, otherwise the whole payload (excluding 'message')
        } else {
          // This path handles direct returns of DTOs or arrays of DTOs from controllers
          finalMessage = 'Operation successful';
          dataToTransform = responseBody;
        }

        // <<< THE CRITICAL STEP: APPLY classToPlain HERE >>>
        // This will take the DTO instance(s) and apply @Expose, @Exclude
        const transformedData = classToPlain(dataToTransform, {
            // Optional: You can add options here.
            // `excludeExtraneousValues: true` is often useful if your DTO classes
            // are decorated with `@Exclude()` on the class level, or if you want
            // to ensure only `@Expose()` properties are ever included.
            // If you have `@Exclude()` on individual properties, this isn't strictly necessary.
            // excludeExtraneousValues: true,
        });

        return {
          success: true,
          statusCode: statusCode,
          message: finalMessage,
          data: transformedData as T, // Cast back to T for type safety, after transformation
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };
      }),
    );
  }
}