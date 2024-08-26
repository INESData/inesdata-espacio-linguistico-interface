import type { Paginated } from '@/models/paginated';
import type { Pagination } from '@/models/pagination';
import { type SearchFilters } from '@/models/search-filters';
import type { Policy } from '@/models/policy';
import type { PolicyType } from '@/models/policy-type';
import DataService from '@/services/data-service';

export interface PolicyUpdate {
  id: string;
  name: string;
  permissions: string;
  prohibitions: string;
  obligations: string;
  type: PolicyType;
  user: number;
  creationDate: number;
}

class PolicyService extends DataService<Policy, SearchFilters> {

  apiPath = this.baseUrl + '/v2/policydefinitions';

  async toEntity(data: any): Promise<Policy> {

    const policy:Policy = {
      id: data['@id'],
      creationDate: data['createdAt'],
      name: data.privateProperties['name'],
      permissions: '',
      prohibitions: '',
      obligations: '',
      type: data.privateProperties['policy_type']
    };

    if (data.policy['odrl:permission'])
      policy.permissions = JSON.stringify(data.policy['odrl:permission'], null, 2);

    if (data.policy['odrl:prohibition'])
      policy.prohibitions = JSON.stringify(data.policy['odrl:prohibition'], null, 2);

    if (data.policy['odrl:obligation'])
      policy.obligations = JSON.stringify(data.policy['odrl:obligation'], null, 2);

    return policy;
  }

  buildEntityRequest(entity: Policy) {

    let policyRequest: any = {
      "@context": {
          "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
          "odrl": "http://www.w3.org/ns/odrl/2/"
      },
      policy: {
        "@context": "http://www.w3.org/ns/odrl.jsonld",
        "@type": "Set",
        "odrl:permission": [],
        "odrl:prohibition": [],
        "odrl:obligation": []
      },
      privateProperties: {
          "policy_type": entity.type,
          "name": entity.name
      }
    }

    if (entity.id) {
      policyRequest["@id"] = entity.id;
    }

    if (entity.permissions && entity.permissions != "[]")
      policyRequest.policy["odrl:permission"].push(JSON.parse(entity.permissions));

    if (entity.prohibitions && entity.prohibitions != "[]")
      policyRequest.policy["odrl:prohibition"].push(JSON.parse(entity.prohibitions));

    if (entity.obligations && entity.obligations != "[]")
      policyRequest.policy["odrl:obligation"].push(JSON.parse(entity.obligations));
    
    return policyRequest;
  }
}

export default new PolicyService();
