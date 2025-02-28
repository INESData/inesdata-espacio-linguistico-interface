import type { Paginated } from '@/models/paginated';
import type { Pagination } from '@/models/pagination';
import { type SearchFilters } from '@/models/search-filters';
import indexeddb from '@/utils/indexeddb';
import type { Negotiation } from '@/models/negotiation';
import { NegotiationType } from '@/models/negotiation-type';
import DataService from '@/services/data-service';
import contractAgreementService from '@/services/contract-agreement-service';
import type { Transfer } from '@/models/transfer';
import { DestinationType } from '@/models/destination-type';
import axios, { type AxiosRequestConfig } from 'axios';
import type { DataDestination } from '@/models/data-destination';
import { ContentTypes } from '@/models/content-types';
import assetService from './asset-service';


class TransferService extends DataService<Transfer, SearchFilters> {

  apiPath = this.baseUrl + '/v3/transferprocesses';

  entityType = "transferProcess";

  async toEntity(data: any): Promise<Transfer> {

    const transfer:Transfer = {
      id: data['@id'],
      state: data['state'],
      stateDate: data['stateTimestamp'],
      type: data['type'],

      correlationId: data['correlationId'],
      assetId: data['assetId'],
      contractId: data['contractId'],

      transferType: data['transferType']

    }

    if (data.dataDestination) {
      //transfer.dataDestination.type = data.dataDestination['type'];
    }

    return transfer;
  }

  buildEntityRequest(entity: Transfer) {
    return {};
  }

  async startTransfer(contractId: string, assetId: string, connectorId: string, counterPartyAddress: string) {

    var transferRequest: any = {
      "@context": {
        "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
      },
      "@type": "TransferRequestDto",
      "connectorId": connectorId,
      "counterPartyAddress": counterPartyAddress.replace('\n', ''),
      "contractId": contractId,
      "assetId": assetId,
      "protocol": "dataspace-protocol-http",
      "transferType": "HttpData-PULL",
      /*"managedResources": true*/
    };

    let url = this.apiPath;

    let newEntity:any;
    await axios.post(url, transferRequest)
    .then((response) => { newEntity = response.data })
    .catch((error) => { newEntity = {}});

    return newEntity
  }

  async checkTransferStatus(transferId: string) {

    let url = this.apiPath + '/' + transferId;

    const response = await axios.get(url);

    let state = response.data["state"];

    if (state == "COMPLETED" || state == "TERMINATED" || state == "DEPROVISIONED")
      return true;
    else
      return false;

  }

  async terminateTransfer(transferId: string) {

    let url = this.apiPath + '/' + transferId + '/terminate';

    var request: any = {
      "@context": {
        "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
      },
      "@type": "TerminateTransfer",
      "reason": "Transfer finished"
    };

    const response = await axios.post(url, request);

  }

  async getTransferEndpoint(transferId: string) {

    let url = this.baseUrl + '/v3/edrs/' + transferId + '/dataaddress';

    return await axios.get(url);
  }

  async executeServiceRequest(transferId: string, endpointUrl: string, jsonRequest: string) {

    const endpointResponse = await this.getTransferEndpoint(transferId);

    const authorization = endpointResponse.data["authorization"];
    let serviceUrlPrefix = endpointResponse.data["endpoint"];

    let requestConfig = {      
      headers: {
        'Authorization': authorization
      },
      responseType: 'json'
    } as AxiosRequestConfig;

    let serviceResponse:any;
    await axios.post(serviceUrlPrefix + '/' + endpointUrl, JSON.parse(jsonRequest), requestConfig)
    .then((response) => {
      serviceResponse = response.data;
    })
    .catch((error) => { serviceResponse = {}});

    return serviceResponse
  }

  async downloadFile(transferId: string, assetId: string) {

    const response = await this.getTransferEndpoint(transferId);

    const authorization = response.data["authorization"];
    let downloadFileUrl = response.data["endpoint"];

    let requestConfig = {      
      headers: {
        'Authorization': authorization
      },
      responseType: 'blob'
    } as AxiosRequestConfig;

    const responseFile = await axios.get(downloadFileUrl, requestConfig);

    let extension = this.getExtension(responseFile.data.type);
    
    if (extension == "" && assetId != undefined) {

      const asset = await assetService.readFromCatalog(assetId);

      extension = this.getExtension(asset.contenttype);
    }

    const link = document.createElement('a');
    link.href = URL.createObjectURL(responseFile.data);
    link.download = 'Download' + extension;
    link.click();
  }

  private getExtension(contentType: string) : string {

    if (contentType == ContentTypes.BZIP)
      return ".bz";
    else if (contentType == ContentTypes.BZIP2)
      return ".bz2";
    else if (contentType == ContentTypes.CSV)
      return ".csv";
    else if (contentType == ContentTypes.GZIP)
      return ".gz";
    else if (contentType == ContentTypes.JSON)
      return ".json";
    else if (contentType == ContentTypes.PDF)
      return ".pdf";
    else if (contentType == ContentTypes.RAR)
      return ".rar";
    else if (contentType == ContentTypes.TAR)
      return ".tar";
    else if (contentType == ContentTypes.TEXT)
      return ".txt";
    else if (contentType == ContentTypes.XLSX)
      return ".xlsx";
    else if (contentType == ContentTypes.XML)
      return ".xml";
    else if (contentType == ContentTypes.ZIP)
      return ".zip";
    else if (contentType == ContentTypes._7ZIP)
      return ".7z";
    else
      return "";
  }
  
}

export default new TransferService();
