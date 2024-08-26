import { FilterType } from '@/models/filter';
import type { Pagination } from '@/models/pagination';
import type { SearchFilters } from '@/models/search-filters';
import router from '@/router';

export function loadRouteQueryParams(paginationOptions: Pagination, filters: SearchFilters) {
  const queries = router.currentRoute.value.query;
  if (queries.page) {
    paginationOptions.page = parseInt(queries.page.toString());
  }
  if (queries.sort) {
    paginationOptions.sort = queries.sort as any;
  }
  if (queries.size) {
    paginationOptions.size = parseInt(queries.size.toString());
  }
  for (const filter in filters) {
    if (queries[filter]) {
      if (filters[filter].type === FilterType.SELECT) {
        if (queries[filter] instanceof Array) {
          filters[filter].value = queries[filter];
        } else {
          filters[filter].value = [queries[filter]];
        }
      } else {
        filters[filter].value = queries[filter];
      }
    }
  }
}

export function updateRouteQueryParams(queries: SearchFilters, force?: boolean) {
  const url: URL = new URL(window.location.origin + window.location.pathname);
  for (const q in queries) {
    if (Array.isArray(queries[q])) {
      for (const v of queries[q]) {
        url.searchParams.append(q, v);
      }
    } else {
      url.searchParams.set(q, queries[q]);
    }
  }
  if (force) {
    router.replace(window.location.pathname + '?' + url.searchParams.toString());
  } else {
    history.replaceState(null, '', url);
    router.currentRoute.value.query = queries;
  }
}
