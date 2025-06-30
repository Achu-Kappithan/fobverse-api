import { HttpStatus } from '@nestjs/common';

export interface BaseApiResponse {
  success: boolean;
  statusCode: HttpStatus;
  message: string | string[];
  path: string;
}

export interface SuccessApiResponse<T> extends BaseApiResponse {
  success: true;
  data?: T;
}

export interface ErrorApiResponse extends BaseApiResponse {
  success: false;
  error: string;
  details?: any;
}
