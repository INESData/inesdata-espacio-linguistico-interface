import corpusJson from '@/assets/fake-data/corpus.json';
import servicesJson from '@/assets/fake-data/services.json';
import modelsJson from '@/assets/fake-data/models.json';
import lexicalResourcesJson from '@/assets/fake-data/lexical-resources.json';
import contractsJson from '@/assets/fake-data/contracts.json';
import policiesJson from '@/assets/fake-data/policies.json';
import usersJson from '@/assets/fake-data/users.json';
import langsJson from '@/assets/fake-data/languages.json';
import categoriesJson from '@/assets/fake-data/categories.json';
import negotiationsJson from '@/assets/fake-data/negotiations.json';
import type { Paginated } from '@/models/paginated';
import type { Asset } from '@/models/asset';
import type { Contract } from '@/models/contract';
import type { Policy } from '@/models/policy';
import type { User } from '@/models/user';
import type { Negotiation } from '@/models/negotiation';
import userService from '@/services/user-service';
import type { Language } from '@/models/language';
import type { Category } from '@/models/category';
import type { AssetUpdate } from '@/services/asset-service';
import type { ContractUpdate } from '@/services/contract-service';
import type { PolicyUpdate } from '@/services/policy-service';
import policyService from '@/services/policy-service';
import languageService from '@/services/language-service';
import categoryService from '@/services/category-service';
import contractService from '@/services/contract-service';
import type { NegotiationUpdate } from '@/services/negotiation-service';
import assetService from '@/services/asset-service';
import { NegotiationType } from '@/models/negotiation-type';

class IndexedDb {
  dbName = 'inesdata_db';
  dbVersion = 4;
  db = undefined;

  async init(): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = function (e) {
        const db = (e.target as any).result;

        // Init assets
        const assetsStore = db.createObjectStore('assets', { keyPath: 'id', autoIncrement: true });
        assetsStore.createIndex('name', 'name', { unique: false });
        assetsStore.createIndex('user', 'user', { unique: false });
        const assetsData = [
          ...(corpusJson as unknown as Paginated<AssetUpdate>).content,
          ...(servicesJson as unknown as Paginated<AssetUpdate>).content,
          ...(modelsJson as unknown as Paginated<AssetUpdate>).content,
          ...(lexicalResourcesJson as unknown as Paginated<AssetUpdate>).content,
        ];
        let id = 0;
        assetsData.forEach((asset) => {
          id++;
          asset.id = String(id);
          assetsStore.add(asset);
        });

        // Init Contracts
        const contractsStore = db.createObjectStore('contracts', {
          keyPath: 'id',
          autoIncrement: true,
        });
        const contractsData = contractsJson as unknown as ContractUpdate[];
        contractsData.forEach((contract) => {
          contractsStore.add(contract);
        });

        // Init Policies
        const policiesStore = db.createObjectStore('policies', {
          keyPath: 'id',
          autoIncrement: true,
        });
        const policiesData = policiesJson as unknown as Policy[];
        policiesData.forEach((policy) => {
          policiesStore.add(policy);
        });

        // Init Negotiations
        const negotiationsStore = db.createObjectStore('negotiations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        const negotiationsData = negotiationsJson as unknown as [];
        negotiationsData.forEach((negotiation) => {
          negotiationsStore.add(negotiation);
        });

        // Init Users
        const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        const usersData = usersJson as unknown as User[];
        usersData.forEach((user) => {
          usersStore.add(user);
        });

        // Init Langs
        const langsStore = db.createObjectStore('langs', {
          keyPath: 'id',
          autoIncrement: true,
        });
        const langsData = langsJson as unknown as Language[];
        langsData.forEach((lang) => {
          langsStore.add(lang);
        });

        // Init Categories
        const categoriesStore = db.createObjectStore('categories', {
          keyPath: 'id',
          autoIncrement: true,
        });
        const categoriesData = categoriesJson as unknown as Category[];
        categoriesData.forEach((category) => {
          categoriesStore.add(category);
        });

        window.location.reload();
      };

      request.onsuccess = (e) => {
        const db = (e.target as any).result;
        this.db = db;
        resolve(db);
      };
    });
  }

  // ASSETS
  /*
  async assetToDto(asset: AssetUpdate) {
    const assetDto: Asset = {
      id: asset.id,
      name: asset.name,
      description: asset.description,
      textContent: asset.textContent,
      creationDate: asset.creationDate,
      languages: [],
      categories: [],
      contracts: [],
      type: asset.type,
      contents: asset.contents,
    };

    const langs = [];
    for (const lang of asset.languages) {
      langs.push(await languageService.read(lang as number));
    }
    assetDto.languages = langs;

    const categories = [];
    for (const cat of asset.categories) {
      categories.push(await categoryService.read(cat as number));
    }
    assetDto.categories = categories;

    const contracts = [];
    for (const contract of asset.contracts) {
      contracts.push(await contractService.read(contract as unknown as string));
    }
    assetDto.contracts = contracts;

    assetDto.user = await userService.read(asset.user as number);
    return assetDto;
  }
  async getAssets(): Promise<Asset[]> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('assets', 'readonly');
      const objectStore = transaction.objectStore('assets');
      objectStore.getAll().onsuccess = async (event: any) => {
        const assets: Asset[] = [];
        for (const c of event.target.result) {
          assets.push(await this.assetToDto(c));
        }
        resolve(assets);
      };
    });
  }

  async getAsset(id: number): Promise<Asset> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('assets', 'readonly');
      const objectStore = transaction.objectStore('assets');
      objectStore.get(id).onsuccess = async (event: any) => {
        resolve(await this.assetToDto(event.target.result));
      };
    });
  }

  async deleteAsset(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('assets', 'readwrite');
      const objectStore = transaction.objectStore('assets');
      const request = objectStore.delete(id);
      request.onsuccess = () => {
        resolve(true);
      };
      request.onerror = () => {
        resolve(false);
      };
    });
  }

  async createAsset(asset: Asset): Promise<string> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;

      const objectStore = db.transaction('assets', 'readwrite').objectStore('assets');
      const newAsset: AssetUpdate = {
        id: String(new Date().getTime()),
        name: asset.name,
        description: asset.description,
        textContent: asset.textContent,
        creationDate: new Date().getTime(),
        languages: asset.languages.map((l) => l.id),
        categories: asset.categories.map((c) => c.id),
        contracts: asset.contracts.map((c) => c.id as string),
        type: asset.type,
        contents: JSON.parse(JSON.stringify(asset.contents)),
        user: parseInt(userService.currentUser.id as string),
      };
      const request = objectStore.add(newAsset);
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async updateAsset(asset: Asset): Promise<Asset> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;

      const objectStore = db.transaction('assets', 'readwrite').objectStore('assets');
      const request = objectStore.get(asset.id);
      request.onsuccess = (event: any) => {
        const data = event.target.result as AssetUpdate;
        data.name = asset.name;
        data.categories = [...asset.categories].map((c) => c.id);
        data.contents = JSON.parse(JSON.stringify(asset.contents));
        data.contracts = [...asset.contracts].map((c) => c.id as string);
        data.description = asset.description;
        data.languages = [...asset.languages].map((l) => l.id);
        data.textContent = asset.textContent;
        const updateRequest = objectStore.put(data);
        updateRequest.onsuccess = () => {
          resolve(event.target.result);
        };
      };
    });
  }
  */

  // USERS
  async getUser(id: number): Promise<User> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('users', 'readonly');
      const objectStore = transaction.objectStore('users');
      objectStore.get(id).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  // CONTRACTS
  /*
  async contractToDto(contract: ContractUpdate) {
    const contractDto: Contract = {
      name: contract.name,
      contractPolicy: null,
      accessPolicy: null,
      id: contract.id,
      creationDate: contract.creationDate,
    };
    if (contract.contractPolicy) {
      contractDto.contractPolicy = await policyService.read(contract.contractPolicy as string);
    }
    if (contract.accessPolicy) {
      contractDto.accessPolicy = await policyService.read(contract.accessPolicy as string);
    }
    contractDto.user = await userService.read(contract.user as number);
    return contractDto;
  }

  async getContracts(): Promise<Contract[]> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('contracts', 'readonly');
      const objectStore = transaction.objectStore('contracts');
      objectStore.getAll().onsuccess = async (event: any) => {
        const contracts: Contract[] = [];
        for (const c of event.target.result) {
          contracts.push(await this.contractToDto(c));
        }
        resolve(contracts);
      };
    });
  }

  async getContract(id: string): Promise<Contract> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('contracts', 'readonly');
      const objectStore = transaction.objectStore('contracts');
      objectStore.get(id).onsuccess = async (event: any) => {
        resolve(await this.contractToDto(event.target.result));
      };
    });
  }

  async deleteContract(id: number): Promise<boolean> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const assets = await this.getAssets();
      for (const asset of assets) {
        if (asset.contracts.find((c) => c.id?.toString() === id.toString())) {
          asset.contracts = asset.contracts.filter((c) => c.id?.toString() !== id.toString());
          await this.updateAsset(asset);
        }
      }

      const transaction = db.transaction('contracts', 'readwrite');
      const objectStore = transaction.objectStore('contracts');
      const request = objectStore.delete(id);
      request.onsuccess = () => {
        resolve(true);
      };
      request.onerror = () => {
        resolve(false);
      };
    });
  }

  async createContract(contract: Contract): Promise<string> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;

      const objectStore = db.transaction('contracts', 'readwrite').objectStore('contracts');
      const newPolicy: ContractUpdate = {
        id: String(new Date().getTime()),
        name: contract.name,
        contractPolicy: contract.contractPolicy?.id as string,
        accessPolicy: contract.accessPolicy?.id as string,
        user: parseInt(userService.currentUser.id as string),
        creationDate: new Date().getTime(),
      };
      const request = objectStore.add(newPolicy);
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async updateContract(contract: Contract): Promise<Contract> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;

      const objectStore = db.transaction('contracts', 'readwrite').objectStore('contracts');
      const request = objectStore.get(contract.id);
      request.onsuccess = (event: any) => {
        const data = event.target.result as ContractUpdate;
        data.name = contract.name;
        data.contractPolicy = contract.contractPolicy
          ? (contract.contractPolicy?.id as string)
          : null;
        data.accessPolicy = contract.accessPolicy ? (contract.accessPolicy?.id as string) : null;
        const updateRequest = objectStore.put(data);
        updateRequest.onsuccess = () => {
          resolve(event.target.result);
        };
      };
    });
  }

  // POLICIES
  async policyToDto(policy: PolicyUpdate) {
    const policyDto: Policy = {
      name: policy.name,
      permissions: policy.permissions,
      prohibitions: policy.prohibitions,
      obligations: policy.obligations,
      type: policy.type,
      id: policy.id,
      creationDate: policy.creationDate,
    };
    policyDto.user = await userService.read(policy.user as number);
    return policyDto;
  }

  async getPolicies(): Promise<Policy[]> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('policies', 'readonly');
      const objectStore = transaction.objectStore('policies');
      objectStore.getAll().onsuccess = async (event: any) => {
        const policies: Policy[] = [];
        for (const c of event.target.result) {
          policies.push(await this.policyToDto(c));
        }
        resolve(policies);
      };
    });
  }

  async getPolicy(id: number): Promise<Policy> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('policies', 'readonly');
      const objectStore = transaction.objectStore('policies');
      objectStore.get(id).onsuccess = async (event: any) => {
        resolve(await this.policyToDto(event.target.result));
      };
    });
  }

  async deletePolicy(id: string): Promise<boolean> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const contracts = await this.getContracts();
      for (const contract of contracts) {
        if (contract.contractPolicy && contract.contractPolicy.id === id) {
          contract.contractPolicy = null;
          await this.updateContract(contract);
        } else if (contract.accessPolicy && contract.accessPolicy.id === id) {
          contract.accessPolicy = null;
          await this.updateContract(contract);
        }
      }

      const transaction = db.transaction('policies', 'readwrite');
      const objectStore = transaction.objectStore('policies');
      const request = objectStore.delete(id);
      request.onsuccess = () => {
        resolve(true);
      };
      request.onerror = () => {
        resolve(false);
      };
    });
  }

  async createPolicy(policy: Policy): Promise<string> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;

      const objectStore = db.transaction('policies', 'readwrite').objectStore('policies');
      const newPolicy: PolicyUpdate = {
        id: String(new Date().getTime()),
        name: policy.name,
        permissions: policy.permissions,
        prohibitions: policy.prohibitions,
        obligations: policy.obligations,
        type: policy.type,
        user: parseInt(userService.currentUser.id as string),
        creationDate: new Date().getTime(),
      };
      const request = objectStore.add(newPolicy);
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async updatePolicy(policy: Policy): Promise<Policy> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;

      const objectStore = db.transaction('policies', 'readwrite').objectStore('policies');
      const request = objectStore.get(policy.id);
      request.onsuccess = (event: any) => {
        const data = event.target.result as PolicyUpdate;
        data.name = policy.name;
        data.permissions = policy.permissions.toString(),
        data.prohibitions = policy.prohibitions.toString(),
        data.obligations = policy.obligations.toString(),
        data.type = policy.type;
        const updateRequest = objectStore.put(data);
        updateRequest.onsuccess = () => {
          resolve(event.target.result);
        };
      };
    });
  }

  // NEGOTIATIONS
  async negotiationToDto(negotiation: NegotiationUpdate) {
    const assetOwner = await userService.read(negotiation.assetOwnerId as number);
    const acquirer = await userService.read(negotiation.acquirerId as number);
    const contract = await contractService.read(negotiation.contractId as string);
    const asset = await assetService.read(negotiation.assetId as string);
    const negotiationDto: Negotiation = {
      id: negotiation.id,
      status: negotiation.status,
      last_updated: negotiation.last_updated,
      asset: asset,
      contract: contract,
      assetOwner: assetOwner,
      acquirer: acquirer,
      creationDate: negotiation.creationDate,
    };
    return negotiationDto;
  }

  async getNegotiations(): Promise<Negotiation[]> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('negotiations', 'readonly');
      const objectStore = transaction.objectStore('negotiations');
      objectStore.getAll().onsuccess = async (event: any) => {
        const negotiations: Negotiation[] = [];
        for (const n of event.target.result) {
          negotiations.push(await this.negotiationToDto(n));
        }
        resolve(negotiations);
      };
    });
  }

  async getNegotiation(id: number): Promise<Negotiation> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('negotiations', 'readonly');
      const objectStore = transaction.objectStore('negotiations');
      objectStore.get(id).onsuccess = async (event: any) => {
        resolve(await this.negotiationToDto(event.target.result));
      };
    });
  }

  async acceptNegotiation(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;

      const objectStore = db.transaction('negotiations', 'readwrite').objectStore('negotiations');
      const request = objectStore.get(id);
      request.onsuccess = (event: any) => {
        const data = event.target.result as NegotiationUpdate;
        data.status = NegotiationType.COMPLETED;
        const updateRequest = objectStore.put(data);
        updateRequest.onsuccess = () => {
          resolve(event.target.result);
        };
      };
    });
  }

  async refuseNegotiation(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;

      const objectStore = db.transaction('negotiations', 'readwrite').objectStore('negotiations');
      const request = objectStore.get(id);
      request.onsuccess = (event: any) => {
        const data = event.target.result as NegotiationUpdate;
        data.status = NegotiationType.REFUSED;
        const updateRequest = objectStore.put(data);
        updateRequest.onsuccess = () => {
          resolve(event.target.result);
        };
      };
    });
  }
  */
 
  // LANGS
  async getLanguages(): Promise<Language[]> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('langs', 'readonly');
      const objectStore = transaction.objectStore('langs');
      objectStore.getAll().onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async getLanguage(id: number): Promise<Language> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('langs', 'readonly');
      const objectStore = transaction.objectStore('langs');
      objectStore.get(id).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('categories', 'readonly');
      const objectStore = transaction.objectStore('categories');
      objectStore.getAll().onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async getCategory(id: number): Promise<Category> {
    return new Promise((resolve, reject) => {
      const db: any = this.db;
      if (!db) return;
      const transaction = db.transaction('categories', 'readonly');
      const objectStore = transaction.objectStore('categories');
      objectStore.get(id).onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }
}

export default new IndexedDb();
