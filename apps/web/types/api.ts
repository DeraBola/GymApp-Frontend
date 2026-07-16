/** Standard API response envelope from the backend */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Paginated result wrapper */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
