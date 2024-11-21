import type { NegotiationType } from '@/models/negotiation-type';
import type { ContractAgreement } from '@/models/contract-agreement';
import assetService from '@/services/asset-service';
import axios from 'axios';

export interface NegotiationUpdate {
  id: number;
  status: NegotiationType;
  last_updated: number;
  assetId: string;
  contractId: string;
  assetOwnerId: number;
  acquirerId: number;
  creationDate: number;
}

class ContractAgreementService {

  baseUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

  apiPath = this.baseUrl + '/v3/contractagreements';

  private async toEntity(data: any): Promise<ContractAgreement> {

    const agreement:ContractAgreement = {
      id: data['@id'],
      asset: await assetService.readFromCatalog(data['assetId']),
      policy: JSON.stringify(data['policy'], null, 2),
      signingDate: data['contractSigningDate'],
      consumerId: data['consumerId'],
      providerId: data['providerId']
    }  

    return agreement;
  }

  async read(id: string): Promise<ContractAgreement> {
    let url = this.apiPath + '/' + id;
    const response = await axios.get(url);
    return this.toEntity(response.data);
  }

}

export default new ContractAgreementService();
