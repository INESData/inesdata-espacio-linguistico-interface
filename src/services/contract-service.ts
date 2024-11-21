import type { Paginated } from '@/models/paginated';
import type { Pagination } from '@/models/pagination';
import { type SearchFilters } from '@/models/search-filters';
import type { Contract } from '@/models/contract';
import type { Asset } from '@/models/asset';
import DataService from '@/services/data-service';
import policyService from '@/services/policy-service';
import assetService from '@/services/asset-service';
import axios from 'axios';

export interface ContractUpdate {
  id: string;
  name: string;
  contractPolicy: string | null;
  accessPolicy: string | null;
  user: number;
  creationDate: number;
}

class ContractService extends DataService<Contract, SearchFilters> {

  apiPath = this.baseUrl + '/v3/contractdefinitions';

  entityType = "contractDefinition";

  async toEntity(data: any): Promise<Contract> {
    
    const contract:Contract = {
      id: data['@id'],
      creationDate: data['createdAt'],
      name: '',
      contractPolicy: await policyService.read(data['contractPolicyId']),
      accessPolicy: await policyService.read(data['accessPolicyId']),
      assets: []
    };

    if (data.privateProperties)
      contract.name = data.privateProperties['name'];

    if (data.assetsSelector && data.assetsSelector["operandRight"]) {
      const assetFilterIds = data.assetsSelector["operandRight"];
      if (Array.isArray(assetFilterIds)) {
        for (const assetId of assetFilterIds) {
          const assetResponse = await assetService.read(assetId);
          if (assetResponse)
            contract.assets.push(assetResponse);
        }
      }
      else {
        const assetResponse = await assetService.read(assetFilterIds);
          if (assetResponse)
            contract.assets.push(assetResponse);
      }
    }

    return contract;
  }

  buildEntityRequest(entity: Contract) {

    let contractRequest: any = {
      "@context": {
          "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
      },
      "accessPolicyId": entity.accessPolicy?.id,
      "contractPolicyId": entity.contractPolicy?.id,
      "assetsSelector": [],
      privateProperties: {
        "name": entity.name
      }
    };

    if (entity.id) {
      contractRequest["@id"] = entity.id;
    }
    
    const assetFilterCriterion: any = {
      "operandLeft": "https://w3id.org/edc/v0.0.1/ns/id",
      "operator": "in",
      "operandRight": []
    }

    for (const asset of entity.assets)
      assetFilterCriterion.operandRight.push(asset.id);

    if (entity.assets.length > 0)
      contractRequest.assetsSelector.push(assetFilterCriterion);

    return contractRequest;
  }

  async getContractAssets(id: string): Promise<Asset[]> {
    const contract = await this.read(id);
    return contract.assets;
  }

}

export default new ContractService();
