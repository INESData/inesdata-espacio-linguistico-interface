import type { Language } from '@/models/language';
import indexeddb from '@/utils/indexeddb';

class CategoriesService /* extends DataService<Contract, SearchFilters> */ {
  apiPath = import.meta.env.VITE_APP_BACKEND_API_URL + 'categories';

  async readAll(): Promise<Language[]> {
    return await indexeddb.getCategories();
  }

  async read(id: number): Promise<Language> {
    return await indexeddb.getCategory(id);
  }
}

export default new CategoriesService();
