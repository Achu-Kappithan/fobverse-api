/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessApiResponse, PaginationMeta } from '../responses/api.response';
import { Request, Response } from 'express';

interface ServiceResponsePayload<T> {
  message?: string;
  data?: T;
  [key: string]: any;
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
      SuccessApiResponse<T>
    >
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((responseBody) => {
        let finalMessage: string;
        let finalData: any;
        let finalMeta: PaginationMeta | undefined = undefined;

        const statusCode = response.statusCode || HttpStatus.OK;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const isPaginatedResponse =
          responseBody &&
          typeof responseBody === 'object' &&
          'data' in responseBody &&
          Array.isArray(responseBody.data) &&
          'totalItems' in responseBody &&
          'currentPage' in responseBody &&
          'itemsPerPage' in responseBody &&
          'totalPages' in responseBody;

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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          finalData = responseBody;
        }

        return {
          success: true,
          statusCode: statusCode,
          message: finalMessage,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: finalData,
          meta: finalMeta,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };
      }),
    );
  }
}
