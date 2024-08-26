import type { PolicyType } from './policy-type';
import type { User } from './user';

export interface Policy {
  id?: string;
  name: string;
  contractOfferId: string;
  permissions: string;
  prohibitions: string;
  obligations: string;
  type: PolicyType;
  user?: User;
  creationDate: number;
}
