export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}
