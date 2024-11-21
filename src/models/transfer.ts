import type { ContractAgreement } from './contract-agreement';
import type { DataDestination } from './data-destination';
import type { NegotiationType } from './negotiation-type';
import type { User } from './user';

export interface Transfer {
  id: string;
  state: string;
  stateDate: number;
  type: string;

  correlationId: string;
  assetId: string;
  contractId: string;

  transferType: string;

  dataDestination?: DataDestination;
}
