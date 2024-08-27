import type { Paginated } from '@/models/paginated';
import type { Pagination } from '@/models/pagination';
import { type SearchFilters } from '@/models/search-filters';
import indexeddb from '@/utils/indexeddb';
import type { Negotiation } from '@/models/negotiation';
import { NegotiationType } from '@/models/negotiation-type';
import DataService from '@/services/data-service';
import contractAgreementService from '@/services/contract-agreement-service';

export interface NegotiationUpdate {
  id: string;
  status: NegotiationType;
  last_updated: number;
  assetId: string;
  contractAgreementId: string;
  assetOwnerId: number;
  counterPartyId: string;
  creationDate: number;
}

class NegotiationService extends DataService<Negotiation, SearchFilters> {

  apiPath = this.baseUrl + '/v2/contractnegotiations';

  async toEntity(data: any): Promise<Negotiation> {

    const negotiation:Negotiation = {
      id: data['@id'],
      status: NegotiationType.PENDING,
      creationDate: data['createdAt'],
      type: data['type'],
      counterPartyId: data['counterPartyId']
    }

    if (data['state'] == "FINALIZED")
      negotiation.status = NegotiationType.COMPLETED;

    if (data['state'] == "TERMINATED")
      negotiation.status = NegotiationType.REFUSED;

    if (data['contractAgreementId'] && data['contractAgreementId'] != "")
      negotiation.contractAgreement = await contractAgreementService.read(data['contractAgreementId']);  

    return negotiation;
  }

  buildEntityRequest(entity: Negotiation) {

    var negotiationRequest: any = {
      "@context": {
        "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
        "odrl": "http://www.w3.org/ns/odrl.jsonld"
      },
      "@type": "ContractRequest",
      "protocol": "dataspace-protocol-http",
      "policy": {

      }
    };

    return negotiationRequest;
  }

  /*
  async readContract(id: string): Promise<TEntity> {
    const url = this.apiPath + '/' + id;
    const response = await axios.get(url);
    return this.toEntity(response.data);
  }
  */

  /*
  async read(id: number): Promise<Negotiation> {
    return await indexeddb.getNegotiation(id);
  }
  */
  async acceptProposal(id: string): Promise<void> {
    //return await indexeddb.acceptNegotiation(id);
  }

  async refuseProposal(id: string): Promise<void> {
    //return await indexeddb.refuseNegotiation(id);
  }
  
  
}

export default new NegotiationService();
