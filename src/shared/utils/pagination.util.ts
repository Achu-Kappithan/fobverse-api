import { PaginatedResponse } from '../responses/api.response';
export class PaginationUtil {
  static toPaginatedResponse<T>(
    data: T,
    total: number,
    page: number,
    limit: number,
    message: string,
  ): PaginatedResponse<T> {
    return {
      message,
      data,
      totalItems: total,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
