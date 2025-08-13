

export interface GetAllcompanyResponce<T> {
    message:string,
    data: T[]
}

export interface PlainResponse {
    message:string
}

export interface PaginatedResponse<T> {
  message: string;
  data:T;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}