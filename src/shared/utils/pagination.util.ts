import { PaginatedResponse } from '../../admin/interfaces/responce.interface';

export class PaginationUtil {
  /**
   * Transforms a set of data and its total count into a standard paginated response.
   * @param data The data items for the current page
   * @param total The total number of items available
   * @param page Current page number
   * @param limit Items per page
   * @param message Success message
   */
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
