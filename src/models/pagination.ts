export interface Pagination {
  page: number;
  size: number;
  sort: { key: string; order?: boolean | 'asc' | 'desc' }[];
}
