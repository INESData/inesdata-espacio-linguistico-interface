import { type Pagination } from '@/models/pagination';
import { type Paginated } from '@/models/paginated';
import { type SearchFilters } from '@/models/search-filters';
import axios from 'axios';

export default abstract class DataService<TEntity, TFilter> {
  baseUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

  abstract apiPath: string;

  abstract toEntity(data: any): Promise<TEntity>;

  abstract buildEntityRequest(entity: TEntity): any;

  protected buildFilterData(pagination: Pagination | undefined,
    filters?: SearchFilters
  ): any {

    let filterData:any = {
      "@context": {
        "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
      },
      "offset": 0,
      "sortOrder":  "ASC",
      "sortField": "id",
      "filterExpression": []
    }

    if (filters) {

      if (filters.sortField && filters.sortOrder) {
        filterData.sortField = filters.sortField;
        filterData.sortOrder = filters.sortOrder;
      }
      
      if (filters.query) {
        let filter = {
          "operandLeft": "https://w3id.org/edc/v0.0.1/ns/name",
          "operator": "like",
          "operandRight": filters.query + "%"
        };
        filterData.filterExpression.push(filter);
      }

      if (filters.type) {
        let filter = {
          "operandLeft": "https://w3id.org/edc/v0.0.1/ns/type",
          "operator": "=",
          "operandRight": filters.type
        };
        filterData.filterExpression.push(filter);
      }

      if (filters.negotiationType) {
        let filter = {
          "operandLeft": "type",
          "operator": "=",
          "operandRight": filters.negotiationType
        };
        filterData.filterExpression.push(filter);
      }
    }

    /*
    if (pagination) {
      filterData.offset = (pagination.page- 1) * pagination.size;
      if (pagination.size != -1)
        filterData.limit = ((pagination.page- 1) * pagination.size) + pagination.size;
    }
    */

    return filterData;
  }

  protected buildReturnData(results: TEntity[], pagination: Pagination | undefined): Paginated<TEntity> {

    let offset = 0;
    let currentPage = 1;
    let pageSize = -1;
    let totalResultsCount = results.length;
    let pageResults;

    if (pagination) {
      currentPage = pagination.page;
      pageSize = pagination.size;
      offset = (pagination.page- 1) * pagination.size;
    }

    if (pageSize != -1)
      pageResults = results.slice(offset, offset + pageSize);
    else
      pageResults = results.slice(offset);

    const returnData:Paginated<TEntity> = {
      content: pageResults,
      size: pageSize,
      totalElements: results.length,
      totalPages: Math.ceil(totalResultsCount / pageSize),
      last: true,
      number: currentPage
    };

    return returnData;
  }

  async readAll(
    pagination?: Pagination,
    filter?: TFilter,
    signal?: AbortSignal,
  ): Promise<Paginated<TEntity>> {
    const url = this.apiPath + '/request';

    const params = new URLSearchParams();
    if (pagination) {
      //params.append('page', String(pagination.page - 1));
      //params.append('size', String(pagination.size));
      for (const [i, sortItem] of pagination.sort.entries()) {
        params.append('sort', sortItem.key + ',' + sortItem.order);
      }
    }

    const response = await axios.post(url, filter, { params, signal });

    var results = [];
    if (response) {
      for (const elem of response.data) {
        results.push(await this.toEntity(elem));
      }
    }

    return this.buildReturnData(results, pagination);
  }

  async read(id: string): Promise<TEntity> {
    const url = this.apiPath + '/' + id;
    const response = await axios.get(url);
    return this.toEntity(response.data);
  }

  async create(create: TEntity): Promise<TEntity> {
    const url = this.apiPath;
    let data = this.buildEntityRequest(create);
    
    let newEntity:any;
    await axios.post(url, data)
    .then((response) => { newEntity = response.data })
    .catch((error) => { newEntity = {}});

    return newEntity;
  }

  async update(id: string, update: TEntity): Promise<boolean> {
    let success = true;
    const url = this.apiPath + '/' + id;
    let data = this.buildEntityRequest(update);
    await axios.put(url, data).catch((error) => { success = false; });
    return success;
  }

  async delete(id: string): Promise<boolean> {
    let success = true;
    const url = this.apiPath + '/' + id;
    await axios.delete(url).catch((error) => { success = false; });
    return success;
  }

  async search(
    userId: string | undefined,
    pagination: Pagination | undefined,
    filters?: SearchFilters,
    signal?: AbortSignal,
  ): Promise<Paginated<TEntity>> {

    let url = this.apiPath + '/request';
    let filterData = this.buildFilterData(pagination, filters);

    const response = await axios.post(url, filterData);

    var results = [];
    if (response) {
      for (const elem of response.data) {
        results.push(await this.toEntity(elem));
      }
    }
    
    return this.buildReturnData(results, pagination);
  }
}
