import type { Language } from '@/models/language';
import indexeddb from '@/utils/indexeddb';

class LanguageService /* extends DataService<Contract, SearchFilters> */ {
  apiPath = import.meta.env.VITE_APP_BACKEND_API_URL + 'languages';

  async readAll(): Promise<Language[]> {
    return await indexeddb.getLanguages();
  }

  async read(id: number): Promise<Language> {
    return await indexeddb.getLanguage(id);
  }
}

export default new LanguageService();
