import type { Policy } from './policy';
import type { User } from './user';
import type { Asset } from './asset';

export interface Contract {
  id?: string;
  name: string;
  contractPolicy: Policy | null;
  accessPolicy: Policy | null;
  assets: Asset[];
  user?: User;
  creationDate: number;
}
