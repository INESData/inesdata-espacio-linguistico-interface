import type { ContractAgreement } from './contract-agreement';
import type { NegotiationType } from './negotiation-type';
import type { User } from './user';

export interface Negotiation {
  id: string;
  status: NegotiationType;
  contractAgreement?: ContractAgreement;
  type: string;
  counterPartyId?: string;
  creationDate: number;
}
