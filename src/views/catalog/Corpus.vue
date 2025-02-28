<template>
  <Search
    :title="$t('commons.corpus.corpus')"
    icon="$folderTextOutline"
    :description="$t('commons.corpus.corpus-description')"
    :searchFilters="filters"
  />
</template>

<script lang="ts">
import { type Ref } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Search from '@/components/catalog/Search.vue';
import { FilterType } from '@/models/filter';
import { type SearchFilters } from '@/models/search-filters';
import { onMounted } from 'vue';
import languageService from '@/services/language-service';
import categoryService from '@/services/category-service';

export default defineComponent({
  name: 'CorpusView',
  components: { Search },
  setup() {
    const { t } = useI18n();

    const filters: Ref<SearchFilters> = ref({
      query: {
        type: FilterType.SEARCH,
        value: '',
      },
      languages: {
        type: FilterType.SELECT,
        value: [],
        options: [],
        icon: '$flag',
      },
      categories: {
        type: FilterType.SELECT,
        value: [],
        options: [],
        icon: '$shapeOutline',
      },
    } as SearchFilters);

    onMounted(() => {
      loadLanguages();
      loadCategories();
    });

    const loadLanguages = async () => {
      filters.value.languages.options = (await languageService.readAll()).map((l) => l.name);
    };

    const loadCategories = async () => {
      filters.value.categories.options = (await categoryService.readAll()).map((l) => l.name);
    };

    return { filters };
  },
});
</script>

<style scoped lang="scss"></style>
