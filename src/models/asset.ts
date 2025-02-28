import type { AssetFile } from './asset-file';
import type { Category } from './category';
import type { ContractOffer } from './contract-offer';
import type { DataDestination } from './data-destination';
import type { Language } from './language';
import type { EntityType } from './resource-type';
import type { User } from './user';

export interface Asset {
  id?: string;
  name: string;
  version: string;
  description: string;
  textContent: string;
  creationDate?: number;
  keywords?: string;
  languages: Language[];
  categories: Category[];
  user?: User;
  type: EntityType;
  contents: AssetFile[];
  originator?: string;
  participantId?: string;
  contractOffers?: ContractOffer[];

  contenttype: string;

  dataDestination: DataDestination;
  serviceEndpoint?: string;

}
