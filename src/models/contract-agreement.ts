import type { Asset } from './asset';
import type { Policy } from './policy';

export interface ContractAgreement {
  id: string;
  asset: Asset;
  policy: string;
  signingDate: number;
  consumerId: string;
  providerId: string;
}
