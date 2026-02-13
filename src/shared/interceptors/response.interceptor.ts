import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginationMeta, ApiResponse } from '../responses/api.response';
import { Request, Response } from 'express';
interface ServiceResponsePayload<T> {
  message?: string;
  data?: T;
  [key: string]: unknown;
}
interface PaginatedServiceResult<T> {
  message?: string;
  data: T[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}
@Injectable()
export class ResponseInterceptor<T>
  implements
    NestInterceptor<
      T | ServiceResponsePayload<T> | PaginatedServiceResult<T>,
      ApiResponse<T>
    >
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    return next.handle().pipe(
      map((responseBody: unknown) => {
        let finalMessage: string;
        let finalData: unknown;
        let finalMeta: PaginationMeta | undefined = undefined;
        const statusCode = response.statusCode || HttpStatus.OK;
        const responseBodyObj = responseBody as Record<string, unknown>;
        const isPaginatedResponse =
          responseBody &&
          typeof responseBody === 'object' &&
          'data' in responseBodyObj &&
          Array.isArray(responseBodyObj.data) &&
          'totalItems' in responseBodyObj &&
          'currentPage' in responseBodyObj &&
          'itemsPerPage' in responseBodyObj &&
          'totalPages' in responseBodyObj;
        if (isPaginatedResponse) {
          const paginatedPayload = responseBody as PaginatedServiceResult<T>;
          finalMessage = paginatedPayload.message || 'Operation successful';
          finalData = paginatedPayload.data;
          finalMeta = {
            totalItems: paginatedPayload.totalItems,
            currentPage: paginatedPayload.currentPage,
            itemsPerPage: paginatedPayload.itemsPerPage,
            totalPages: paginatedPayload.totalPages,
          };
        } else if (
          responseBody &&
          typeof responseBody === 'object' &&
          !Array.isArray(responseBody) &&
          (responseBody as ServiceResponsePayload<T>).message !== undefined
        ) {
          const servicePayload = responseBody as ServiceResponsePayload<T>;
          finalMessage = servicePayload.message!;
          finalData =
            servicePayload.data !== undefined
              ? servicePayload.data
              : servicePayload;
        } else {
          finalMessage = 'Operation successful';
          finalData = responseBody;
        }
        return {
          success: true,
          statusCode: statusCode,
          message: finalMessage,
          data: finalData as T,
          meta: finalMeta,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };
      }),
    );
  }
}
