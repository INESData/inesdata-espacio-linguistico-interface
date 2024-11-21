import { type Pagination } from '@/models/pagination';
import { type Paginated } from '@/models/paginated';
import { type SearchFilters } from '@/models/search-filters';
import axios from 'axios';

export default abstract class DataService<TEntity, TFilter> {
  baseUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

  abstract apiPath: string;

  abstract entityType: string;

  abstract toEntity(data: any): Promise<TEntity>;

  abstract buildEntityRequest(entity: TEntity): any;

  protected buildFilterData(pagination: Pagination | undefined,
    filters?: SearchFilters
  ): any {

    let filterData:any = {
      "@context": {
        "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
        "dcterms":"http://purl.org/dc/terms/"
      },
      "offset": 0,
      "sortOrder":  "ASC",
      "sortField": "id",
      "filterExpression": []
    }

    filterData.filterExpression = this.buildSearchFilters(filters);

    if (pagination) {

      for (const [i, sortItem] of pagination.sort.entries()) {
        filterData.sortField = sortItem.key;
        filterData.sortOrder = sortItem.order;
      }

      if (filterData.sortOrder != undefined)
        filterData.sortOrder = filterData.sortOrder.toUpperCase();

      filterData.offset = (pagination.page- 1) * pagination.size;
      if (pagination.size != -1)
        filterData.limit = ((pagination.page- 1) * pagination.size) + pagination.size;
    }

    return filterData;
  }

  private buildSearchFilters(filters?: SearchFilters) : any[] {

    let filterExpression = [];

    if (filters) {
      
      if (filters.query) {
        let filter = {
          "operandLeft": "https://w3id.org/edc/v0.0.1/ns/name",
          "operator": "like",
          "operandRight": filters.query + "%"
        };
        filterExpression.push(filter);
      }

      if (filters.type) {
        let filter = {
          "operandLeft": "https://w3id.org/edc/v0.0.1/ns/assetType",
          "operator": "=",
          "operandRight": filters.type
        };
        filterExpression.push(filter);
      }

      if (filters.negotiationType) {
        let filter = {
          "operandLeft": "type",
          "operator": "=",
          "operandRight": filters.negotiationType
        };
        filterExpression.push(filter);
      }

      if (filters.transferType) {
        let filter = {
          "operandLeft": "type",
          "operator": "=",
          "operandRight": filters.transferType
        };
        filterExpression.push(filter);
      }
    }

    return filterExpression;
  }

  protected buildReturnData(results: TEntity[], pagination: Pagination | undefined, totalResultsCount: number): Paginated<TEntity> {

    let currentPage = 1;
    let pageSize = -1;
    let isLastPage = false;

    if (pagination) {
      currentPage = pagination.page;
      pageSize = pagination.size;
    }

    let totalPages = Math.ceil(totalResultsCount / pageSize);
    if (totalPages === currentPage) {
      isLastPage = true;
    }
    
    const returnData:Paginated<TEntity> = {
      content: results,
      size: pageSize,
      totalElements: totalResultsCount,
      totalPages: totalPages,
      last: isLastPage,
      number: currentPage
    };

    return returnData;
  }

  async readAll(
    pagination?: Pagination,
    signal?: AbortSignal,
  ): Promise<Paginated<TEntity>> {

    return this.search(undefined, pagination);
  }

  async read(id: string): Promise<TEntity> {
    const url = this.apiPath + '/' + id;
    const response = await axios.get(url);
    return this.toEntity(response.data);
  }

  async create(create: TEntity): Promise<TEntity> {
    let url = this.apiPath;
    let data = this.buildEntityRequest(create);

    if (data instanceof FormData && url.endsWith("/assets")) {
      url = this.baseUrl + '/s3assets';
    }
    
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

    let totalResultsCount = await this.searchCount(filters);
    
    let url = this.apiPath + '/request';
    let filterData = this.buildFilterData(pagination, filters);

    const response = await axios.post(url, filterData);

    var results = [];
    if (response) {
      for (const elem of response.data) {
        results.push(await this.toEntity(elem));
      }
    }
    
    return this.buildReturnData(results, pagination, totalResultsCount);
  }

  async searchCount(filters?: SearchFilters) : Promise<number> {

    let url: string;

    if (this.entityType != undefined && this.entityType != "") {
      url = this.baseUrl + '/pagination/count?type=' + this.entityType;
    }
    else {
      url = this.apiPath + '/request';
    }

    let filterData:any = {
      "@context": {
        "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
      },
      "filterExpression": []
    }

    filterData.filterExpression = this.buildSearchFilters(filters);

    const response = await axios.post(url, filterData);

    if (response) {

      if (Array.isArray(response.data))
        return response.data.length;
      else
        return response.data;
    }
    else {
      return 0;
    }
  }
}
