export interface ApiResponse<T> {
  success?: boolean;
  statusCode?: number;
  message: string | string[];
  data?: T;
  meta?: PaginationMeta;
  timestamp?: string;
  path?: string;
  method?: string;
  error?: string;
  details?: unknown;
}

export interface PaginationMeta {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

// Legacy compatibility interfaces (to be phased out)
export interface PlainResponse {
  message: string;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}
