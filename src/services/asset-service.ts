import type { Asset } from '@/models/asset';
import type { Paginated } from '@/models/paginated';
import type { Pagination } from '@/models/pagination';
import { type SearchFilters } from '@/models/search-filters';
import { EntityType } from '@/models/resource-type';
import type { AssetFile } from '@/models/asset-file';
import DataService from '@/services/data-service';
import axios from 'axios';
import type { ContractOffer } from '@/models/contract-offer';
import { DestinationType } from '@/models/destination-type';
import type { DataDestination } from '@/models/data-destination';
import langsJson from '@/assets/fake-data/languages.json';
import type { Language } from '@/models/language';

export interface AssetUpdate {
  id: string;
  name: string;
  description: string;
  textContent: string;
  creationDate: number;
  languages: number[];
  categories: number[];
  user: number;
  type: EntityType;
  contents: AssetFile[];
}

class SearchService extends DataService<Asset, SearchFilters> {

  apiPath = this.baseUrl + '/v3/assets';

  entityType = "asset";

  async toEntity(data: any): Promise<Asset> {
    
    const asset:Asset = {
      id: data['@id'],
      name: data.properties['name'],
      version: data.properties['version'],
      type: data.properties['assetType'],
      description: data.properties['shortDescription'],
      textContent: data.properties['http://purl.org/dc/terms/description'],
      keywords: data.properties['http://www.w3.org/ns/dcat#keyword'],
      creationDate: data.properties['created_at'],
      languages: [],
      categories: [],
      contents: [],
      contenttype: data.properties['contenttype'],
      dataDestination: {
        type: data.dataAddress['type']
      }
    };

    if (asset.type == undefined)
      asset.type = EntityType.CORPUS;

    if (asset.dataDestination.type == DestinationType.HttpData) {
      asset.dataDestination.baseUrl = data.dataAddress["baseUrl"];
      asset.dataDestination.proxyPath = data.dataAddress["proxyPath"];
    }
    else if (asset.dataDestination.type == DestinationType.AmazonS3) {
      asset.dataDestination.region = data.dataAddress["region"];
      asset.dataDestination.bucketName = data.dataAddress["bucketName"];
      asset.dataDestination.keyName = data.dataAddress["keyName"];
    }
    else if (asset.dataDestination.type == DestinationType.InesDataStore) {
      asset.dataDestination.folder = data.dataAddress["folder"];
    }

    if (data.properties.assetData && data.properties.assetData['languages']) {
      if (Array.isArray(data.properties.assetData['languages'])) {
        for (const lang of data.properties.assetData['languages']) {
          asset.languages.push(lang);
        }
      }
      else {
        asset.languages.push(data.properties.assetData['languages']);
      }
    }
    
    if (data.properties.assetData && data.properties.assetData['categories']) {
      if (Array.isArray(data.properties.assetData['categories'])) {
        for (const cat of data.properties.assetData['categories']) {
          asset.categories.push(cat);
        }
      }
      else {
        asset.categories.push(data.properties.assetData['categories']);
      }
    }
    
    return asset;
  }

  buildEntityRequest(entity: Asset) {

    var assetRequest: any = {
      "@context": {
        "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
        "dcterms":"http://purl.org/dc/terms/",
        "dcat":"http://www.w3.org/ns/dcat#"
      },
      properties: {
        "name": entity.name,
        "version": entity.version,
        "assetType": entity.type,
        "shortDescription": entity.description,
        "dcterms:description": entity.textContent,
        "dcat:keyword": entity.keywords,
        "contenttype": entity.contenttype,
        "assetData": {
          "languages": [],
          "categories": []
        }
      },
      dataAddress: {
        "type": entity.dataDestination.type
      }
    };

    if (entity.dataDestination.type == DestinationType.HttpData) {
      assetRequest.dataAddress["name"] = entity.name;
      assetRequest.dataAddress["baseUrl"] = entity.dataDestination.baseUrl;
      assetRequest.dataAddress["proxyPath"] = "true";

      if (entity.type == EntityType.SERVICE) {
        assetRequest.properties.assetData["serviceEnpoint"] = entity.dataDestination.baseUrl;
      }
    }
    else if (entity.dataDestination.type == DestinationType.AmazonS3) {
      assetRequest.dataAddress["region"] = entity.dataDestination.region;
      assetRequest.dataAddress["bucketName"] = entity.dataDestination.bucketName;
      assetRequest.dataAddress["keyName"] = entity.dataDestination.keyName;
    }
    else if (entity.dataDestination.type == DestinationType.InesDataStore) {
      assetRequest.dataAddress["folder"] = entity.dataDestination.folder;
    }

    if (entity.id) {
      assetRequest["@id"] = entity.id;
      assetRequest.properties["created_at"] = entity.creationDate;
    }
    else {
      assetRequest.properties["created_at"] = new Date().getTime();
    }

    if (entity.languages) {
      for (const lang of entity.languages) {
        assetRequest.properties.assetData.languages.push(lang);
      }
    }

    if (entity.categories) {
      for (const category of entity.categories) {
        assetRequest.properties.assetData.categories.push(category);
      }
    }

    if (entity.dataDestination.type == DestinationType.InesDataStore) {

      const formData = new FormData();
      formData.append("json", new Blob([JSON.stringify(assetRequest)], { type: "application/json" }));
      formData.append("file", entity.dataDestination.fileToUpload![0]);

      return formData;
    }
    else {

      return assetRequest;
    }
  }

  async getNoContractAssetsCount(userId: string): Promise<number> {
    //TODO delete method
    return 0;
    /*
    return (await indexeddb.getAssets()).filter(
      (a) => a.user?.id.toString() === userId.toString() && a.contracts.length === 0,
    ).length;
    */
  }

  async negotiate(assetId: string, assigner: string, contractOffer: ContractOffer, counterPartyAddress: string): Promise<boolean> {

    let url = this.baseUrl + '/v3/contractnegotiations';

    var contractRequest: any = {
     "@context": {
      "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
      "odrl": "http://www.w3.org/ns/odrl.jsonld"
      },
      "@type": "ContractRequest",
      "counterPartyAddress": counterPartyAddress.replace('\n', ''),
      "protocol": "dataspace-protocol-http",
      "policy": {
        "@context": "http://www.w3.org/ns/odrl.jsonld",
        "@id": contractOffer.id,
        "@type": "Offer",
        "odrl:permission": [],
        "odrl:prohibition": [],
        "odrl:obligation": [],
        "assigner": assigner,
        "target": assetId
      }
    };

    if (contractOffer.permission && contractOffer.permission != "[]")
      contractRequest.policy["odrl:permission"].push(JSON.parse(contractOffer.permission));

    if (contractOffer.prohibition && contractOffer.prohibition != "[]")
      contractRequest.policy["odrl:prohibition"].push(JSON.parse(contractOffer.prohibition));

    if (contractOffer.obligation && contractOffer.obligation != "[]")
      contractRequest.policy["odrl:obligation"].push(JSON.parse(contractOffer.obligation));

    let success = true;
    const response = await axios.post(url, contractRequest)
    .catch((error) => { success = false; });

    return success;
  }

  async getCatalogStatisticsByLang(assetType: string, t: any): Promise<any> {

    let topNLang = 7;

    const searchFilters = {} as SearchFilters;
    searchFilters["type"] = assetType;

    const countTotal = await this.doCatalogSearchCountRequest(searchFilters);

    const langs: string[] = [];
    const langsData = langsJson as unknown as Language[];
    langsData.forEach((lang) => {
      langs.push(lang.name);
    });

    let statisticsByLang = [];

    for (var lang of langs) {

      const searchFiltersByLang = {} as SearchFilters;
      searchFiltersByLang["type"] = assetType;
      searchFiltersByLang["languages"] = [lang];

      const countByLang = await this.doCatalogSearchCountRequest(searchFiltersByLang);

      let statistics = {
        name: t('catalog.filters.languages.options.' + lang),
        count: countByLang
      };
      statisticsByLang.push(statistics);
    }

    statisticsByLang.sort((a,b) => (a.count > b.count) ? -1 : ((b.count > a.count) ? 1 : 0));

    let totalOthers = 0;
    for (let i=topNLang; i < statisticsByLang.length; i=i+1) {
      totalOthers = totalOthers + statisticsByLang[i].count;
    }

    statisticsByLang.splice(topNLang, statisticsByLang.length);

    let statisticsOthers = {
      name: t('landing-page.others'),
      count: (totalOthers)
    };
    statisticsByLang.push(statisticsOthers);

    const statistics = {
      countTotal: countTotal,
      statisticsByLang: statisticsByLang
    };

    return statistics;
  }

  async readFromCatalog(id: string): Promise<Asset> {

    const searchFilters = {} as SearchFilters;
    searchFilters["id"] = id;

    let results = await this.doCatalogSearchRequest(undefined, searchFilters);

    if (results.length > 0)
      return results[0];
    else
      throw new Error('Asset not found');
  }

  async searchFederatedCatalog(userId: string | undefined,
    pagination: Pagination | undefined,
    filters?: SearchFilters,
    signal?: AbortSignal,
  ): Promise<Paginated<Asset>> {

    let totalResultsCount = await this.doCatalogSearchCountRequest(filters);

    let results = await this.doCatalogSearchRequest(pagination, filters);

    return this.buildReturnData(results, pagination, totalResultsCount);
  }

  private async doCatalogSearchRequest(pagination: Pagination | undefined, filters?: SearchFilters): Promise<Asset[]> {

    let url = this.baseUrl + '/federatedcatalog/request';

    let request : any = {
      "@context":{
        "@vocab":"https://w3id.org/edc/v0.0.1/ns/"
      },
      "filterExpression":[]
    };

    request.filterExpression = this.buildCatalogSearchFilters(filters);

    if (filters && filters.id) {
      let filter = {
        "operandLeft": "id",
        "operator": "=",
        "operandRight": filters.id
      };
      request.filterExpression.push(filter);
    }

    if (pagination) {

      for (const [i, sortItem] of pagination.sort.entries()) {
        request.sortField = sortItem.key;
        request.sortOrder = sortItem.order;
      }

      if (request.sortOrder != undefined)
        request.sortOrder = request.sortOrder.toUpperCase();

      request.offset = (pagination.page- 1) * pagination.size;
      if (pagination.size != -1)
        request.limit = ((pagination.page- 1) * pagination.size) + pagination.size;
    }

    const response = await axios.post(url, request);

    var results: Asset[] = [];

    if (response) {
      for (const elem of response.data) {
        var catalogAssets = this.readCatalog(elem);
        for (const asset of catalogAssets)
          results.push(asset);
      }
    }

    return results;
  }

  private async doCatalogSearchCountRequest(filters?: SearchFilters): Promise<number> {

    let url = this.baseUrl + '/pagination/count?type=federatedCatalog';

    let filterData:any = {
      "@context": {
        "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
      },
      "filterExpression": []
    }

    filterData.filterExpression = this.buildCatalogSearchFilters(filters);

    const response = await axios.post(url, filterData);

    if (response) {
      return response.data;
    }
    else {
      return 0;
    }
  }

  private buildCatalogSearchFilters(filters?: SearchFilters) : any[] {

    let filterExpression = [];

    if (filters) {
      
      if (filters.query) {
        let filter = {
          "operandLeft": "genericSearch",
          "operator": "like",
          "operandRight": "%" + filters.query + "%"
        };
        filterExpression.push(filter);
      }

      if (filters.type) {
        let filter = {
          "operandLeft": "genericSearch",
          "operator": "=",
          "operandRight": filters.type
        };
        filterExpression.push(filter);
      }

      if (filters.languages && filters.languages.length > 0) {
        for (const lang of filters.languages) {
          let filter = {
            "operandLeft": "'https://w3id.org/edc/v0.0.1/ns/assetData'.'https://w3id.org/edc/v0.0.1/ns/languages'.'https://w3id.org/edc/v0.0.1/ns/name'",
            "operator": "=",
            "operandRight": lang
          };
          filterExpression.push(filter);
        }
      }

      if (filters.categories && filters.categories.length > 0) {
        for (const category of filters.categories) {
          let filter = {
            "operandLeft": "'https://w3id.org/edc/v0.0.1/ns/assetData'.'https://w3id.org/edc/v0.0.1/ns/categories'.'https://w3id.org/edc/v0.0.1/ns/name'",
            "operator": "=",
            "operandRight": category
          };
          filterExpression.push(filter);
        }
      }
    }

    return filterExpression;
  }

  private readCatalog(elem: any): Asset[] {

    var assets:Asset[] = [];

    var dataset:any = elem['http://www.w3.org/ns/dcat#dataset'];
    
    if (Array.isArray(dataset)) {
      for (const catalogAsset of dataset) {
        const asset = this.readAssetFromCatalog(catalogAsset, elem);
        assets.push(asset);
      }
    }
    else {
      assets.push(this.readAssetFromCatalog(dataset, elem))
    }
    
    return assets;
  }

  private readAssetFromCatalog(catalogAsset: any, catalogElem: any): Asset {

    const asset:Asset = {
      id: catalogAsset['@id'],
      name: catalogAsset['name'],
      version: catalogAsset['version'],
      type: catalogAsset['assetType'],
      description: catalogAsset['shortDescription'],
      textContent: catalogAsset['http://purl.org/dc/terms/description'],
      creationDate: catalogAsset['created_at'],
      languages: [],
      categories: [],
      contents: [],
      originator: catalogElem['originator'],
      participantId: catalogAsset['participantId'],
      contractOffers: [],
      contenttype: catalogAsset['contenttype'],
      dataDestination: {} as DataDestination
    };

    if (catalogAsset.assetData && catalogAsset.assetData['languages']) {
      if (Array.isArray(catalogAsset.assetData['languages'])) {
        for (const lang of catalogAsset.assetData['languages']) {
          asset.languages.push(lang);
        }
      }
      else {
        asset.languages.push(catalogAsset.assetData['languages']);
      }
    }
    
    if (catalogAsset.assetData && catalogAsset.assetData['categories']) {
      if (Array.isArray(catalogAsset.assetData['categories'])) {
        for (const cat of catalogAsset.assetData['categories']) {
          asset.categories.push(cat);
        }
      }
      else {
        asset.categories.push(catalogAsset.assetData['categories']);
      }
    }

    if (catalogAsset.assetData && catalogAsset.assetData['serviceEnpoint']) {
        asset.serviceEndpoint = catalogAsset.assetData['serviceEnpoint'];
    }

    if (catalogAsset["odrl:hasPolicy"]) {
      if (Array.isArray(catalogAsset["odrl:hasPolicy"])) {
        const offers = catalogAsset["odrl:hasPolicy"];
        for (const offer of offers)
          asset.contractOffers!.push(this.readContractOffer(offer));
      }
      else {
        asset.contractOffers!.push(this.readContractOffer(catalogAsset["odrl:hasPolicy"]));
      }
    }

    return asset;
  }

  private readContractOffer(data: any): ContractOffer {

    const policy: ContractOffer = {
      id: data.offer['@id'],
      type: data.offer['@type'],
      permission: '',
      prohibition: '',
      obligation: '',
    };

    if (data.offer['odrl:permission'])
      policy.permission = JSON.stringify(data.offer['odrl:permission'], null, 2);

    if (data.offer['odrl:prohibition'])
      policy.prohibition = JSON.stringify(data.offer['odrl:prohibition'], null, 2);

    if (data.offer['odrl:obligation'])
      policy.obligation = JSON.stringify(data.offer['odrl:obligation'], null, 2);

    return policy;
  }

  wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}

export default new SearchService();
