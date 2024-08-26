import type { Asset } from '@/models/asset';
import type { Paginated } from '@/models/paginated';
import type { Pagination } from '@/models/pagination';
import { type SearchFilters } from '@/models/search-filters';
import { EntityType } from '@/models/resource-type';
import type { AssetFile } from '@/models/asset-file';
import DataService from '@/services/data-service';
import axios from 'axios';
import type { ContractOffer } from '@/models/contract-offer';

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

  async toEntity(data: any): Promise<Asset> {
    
    const asset:Asset = {
      id: data['@id'],
      name: data.properties['name'],
      type: data.properties['type'],
      description: data.properties['description'],
      textContent: data.properties['textContent'],
      creationDate: data.properties['created_at'],
      languages: [],
      categories: [],
      contents: [],
      contenttype: data.properties['contenttype'],
      destination: data.dataAddress['type']
    };

    if (asset.destination == "HttpData") {
      asset.baseUrl = data.dataAddress["baseUrl"];
      asset.proxyPath = data.dataAddress["proxyPath"];
    }
    else if (asset.destination == "AmazonS3") {
      asset.region = data.dataAddress["region"];
      asset.bucketName = data.dataAddress["bucketName"];
      asset.keyName = data.dataAddress["keyName"];
    }

    if (data.properties['languages']) {
      if (Array.isArray(data.properties['languages'])) {
        for (const lang of data.properties['languages']) {
          asset.languages.push(lang);
        }
      }
      else {
        asset.languages.push(data.properties['languages']);
      }
    }
    
    if (data.properties['categories']) {
      if (Array.isArray(data.properties['categories'])) {
        for (const cat of data.properties['categories']) {
          asset.categories.push(cat);
        }
      }
      else {
        asset.categories.push(data.properties['categories']);
      }
    }
    
    return asset;
  }

  buildEntityRequest(entity: Asset) {

    var assetRequest: any = {
      "@context": {
        "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
      },
      properties: {
        "name": entity.name,
        "type": entity.type,
        "description": entity.description,
        "textContent": entity.textContent,
        "languages": [],
        "categories": [],
        "contenttype": entity.contenttype
      },
      dataAddress: {
        "type": entity.destination,
        "name": entity.name,
      }
    };

    if (entity.destination == "HttpData") {
      assetRequest.dataAddress["baseUrl"] = entity.baseUrl;
      assetRequest.dataAddress["proxyPath"] = "true";
    }
    else if (entity.destination == "AmazonS3") {
      assetRequest.dataAddress["region"] = entity.region;
      assetRequest.dataAddress["bucketName"] = entity.bucketName;
      assetRequest.dataAddress["keyName"] = entity.keyName;
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
        assetRequest.properties.languages.push(lang);
      }
    }

    if (entity.categories) {
      for (const category of entity.categories) {
        assetRequest.properties.categories.push(category);
      }
    }

    return assetRequest;
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

    let url = this.baseUrl + '/v2/contractnegotiations';

    var contractRequest: any = {
     "@context": {
      "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
      "odrl": "http://www.w3.org/ns/odrl.jsonld"
      },
      "@type": "ContractRequest",
      "counterPartyAddress": counterPartyAddress,
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

  async readFromCatalog(id: string): Promise<Asset> {

    let results = await this.doCatalogRequest();

    results = results.filter((asset) => asset.id == id)

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

    let results = await this.doCatalogRequest();  

    if (filters && filters.type) {
      results = results.filter((asset) => asset.type ==  filters.type);
    }

    if (filters && filters.query) {
      results = results.filter((asset) => asset.name.toLocaleLowerCase().includes(filters.query.toLocaleLowerCase()))
    }

    if (filters && filters.languages && filters.languages.length > 0) {
      results = results.filter((asset) => this.containsLangs(asset, filters.languages));
    }

    if (filters && filters.categories && filters.categories.length > 0) {
      results = results.filter((asset) => this.containsCategories(asset, filters.categories));
    }

    return this.buildReturnData(results, pagination);
  }

  private containsLangs(asset: Asset, langs: string[]): boolean {
    for (const lang of langs) {
      if (!this.containsLang(asset, lang))
        return false;
    }
    return true;
  }

  private containsLang(asset: Asset, lang: string): boolean {
    for (const l of asset.languages) {
      if (l.name == lang)
        return true;
    }
    return false;
  }

  private containsCategories(asset: Asset, categories: string[]): boolean {
    for (const cat of categories) {
      if (!this.containsCategory(asset, cat))
        return false;
    }
    return true;
  }

  private containsCategory(asset: Asset, category: string): boolean {
    for (const c of asset.categories) {
      if (c.name == category)
        return true;
    }
    return false;
  }

  private async doCatalogRequest(): Promise<Asset[]> {

    let url = this.baseUrl + '/federatedcatalog';

    let request = {
      "edc:operandLeft": "",
      "edc:operandRight": "",
      "edc:operator": "",
      "edc:Criterion":""
    };

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
      type: catalogAsset['type'],
      description: catalogAsset['description'],
      textContent: catalogAsset['textContent'],
      creationDate: catalogAsset['created_at'],
      languages: [],
      categories: [],
      contents: [],
      originator: catalogElem['originator'],
      participantId: catalogElem['participantId'],
      contractOffers: [],
      contenttype: catalogAsset['contenttype'],
      destination: ''
    };

    if (catalogAsset['languages']) {
      if (Array.isArray(catalogAsset['languages'])) {
        for (const lang of catalogAsset['languages']) {
          asset.languages.push(lang);
        }
      }
      else {
        asset.languages.push(catalogAsset['languages']);
      }
    }
    
    if (catalogAsset['categories']) {
      if (Array.isArray(catalogAsset['categories'])) {
        for (const cat of catalogAsset['categories']) {
          asset.categories.push(cat);
        }
      }
      else {
        asset.categories.push(catalogAsset['categories']);
      }
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
      id: data['@id'],
      type: data['@type'],
      permission: '',
      prohibition: '',
      obligation: '',
    };

    if (data['odrl:permission'])
      policy.permission = JSON.stringify(data['odrl:permission'], null, 2);

    if (data['odrl:prohibition'])
      policy.prohibition = JSON.stringify(data['odrl:prohibition'], null, 2);

    if (data['odrl:obligation'])
      policy.obligation = JSON.stringify(data['odrl:obligation'], null, 2);

    return policy;
  }

  wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}

export default new SearchService();
