import type { DestinationType } from './destination-type';

export interface DataDestination {

  type: DestinationType;
  
  baseUrl?: string;
  proxyPath?: boolean;

  region?: string;
  keyName?: string;
  bucketName?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpointOverride?: string;

  fileToUpload?: File[];
  folder?: string;
}
