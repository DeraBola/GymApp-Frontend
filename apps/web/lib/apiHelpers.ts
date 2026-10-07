import { ApiResponse, PagedResult } from '../types/api';

/** An HTTP response whose body is the backend's { success, message, data } envelope (e.g. an AxiosResponse). */
type Envelope<T> = { data?: Partial<ApiResponse<T>> } | null | undefined;

/**
 * Extract the data payload from a standard API response.
 * Backend wraps all responses in { success, message, data }.
 */
export function extractData<T = unknown>(response: Envelope<T>): T {
  return response?.data?.data as T;
}

/**
 * Extract items array from a paginated API response.
 * Backend returns { success, message, data: { items, totalCount, page, ... } }.
 */
export function extractPagedItems<T = unknown>(response: Envelope<PagedResult<T>>): T[] {
  return response?.data?.data?.items ?? [];
}

/**
 * Extract the full paged result (items + pagination metadata).
 */
export function extractPagedResult<T = unknown>(response: Envelope<PagedResult<T>>): PagedResult<T> {
  return response?.data?.data as PagedResult<T>;
}

/**
 * Extract the message from an API response.
 */
export function extractMessage(response: Envelope<unknown>): string {
  return response?.data?.message || '';
}

/**
 * Pull a readable message out of a failed request, including the first
 * validation error the backend returns.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string; detail?: string; errors?: { errors?: { description?: string; message?: string }[] } } } })?.response?.data;
  const validation = data?.errors?.errors;
  if (Array.isArray(validation) && validation.length > 0) {
    return validation[0]?.description || validation[0]?.message || data?.message || fallback;
  }
  return data?.message || data?.detail || fallback;
}
