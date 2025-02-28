<template>
  <Search
    :title="$t('commons.service.service')"
    icon="$cogPlayOutline"
    :description="$t('commons.service.service-description')"
    :searchFilters="filters"
  />
</template>

<script lang="ts">
import { onMounted, type Ref } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Search from '@/components/catalog/Search.vue';
import { FilterType } from '@/models/filter';
import { type SearchFilters } from '@/models/search-filters';
import categoryService from '@/services/category-service';
import languageService from '@/services/language-service';

export default defineComponent({
  name: 'ServicesView',
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
