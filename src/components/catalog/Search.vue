<template>
  <div ref="contentRef">
    <div v-if="isSticky" :style="isSticky ? 'height: ' + (headerHeight + 80) + 'px' : ''"></div>
    <div
      ref="headerRef"
      :class="{ 'sticky-header': isSticky, 'mobile': isMobile }"
      :style="isSticky ? 'width: ' + headerBarWidth + 'px' : '100%'"
    >
      <h1>
        <v-icon size="35" class="mr-2" v-if="$props.icon" :icon="$props.icon"></v-icon>
        {{ $props.title }}
      </h1>
      <p class="description mb-2 mt-1" v-if="$props.description">
        {{ $props.description }}
      </p>
      <v-row :class="{ 'mt-1': !isSticky }">
        <v-col :cols="!isMobile ? '7' : '12'">
          <search-input
            v-if="filters.query"
            v-model="filters.query.value"
            :placeholder="filters.query.label"
            :small="isSticky || undefined"
            :autofocus="searchFocused"
          />
        </v-col>
        <v-col cols="2" class="text-right" v-if="!isSticky && !isMobile">
          <create-button
            :size="!isSticky ? 'large' : undefined"
            :entityType="entityType || undefined"
          />
        </v-col>

        <v-col :cols="isMobile ? '8' : '12'" :class="!isMobile ? 'pa-0' : ''">
          <selected-filters-bar :filters="filters" />
        </v-col>
        <v-col cols="4" v-if="isMobile" class="text-right">
          <div>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props"><v-icon icon="$tune"></v-icon></v-btn>
              </template>
              <div class="filters-bar-mobile">
                <filters :filters="filters" />
              </div>
            </v-menu>
          </div>
        </v-col>
      </v-row>
    </div>
    <div class="mt-3">
      <v-row>
        <v-col cols="12" md="9">
          <search-grid-view
            :items="items"
            :loading="loading"
            :isLastPage="isLastPage"
            :totalPages="totalPages"
            v-model:paginationOptions="paginationOptions"
          />
        </v-col>
        <v-col cols="12" md="3" v-if="!isMobile">
          <div class="filters-bar" ref="filtersbarRef">
            <filters
              :filters="filters"
              :class="{ 'sticky-filters': isSticky }"
              :style="
                isSticky
                  ? 'width: ' + filtersBarWidth + 'px; top: ' + (headerHeight + 20) + 'px'
                  : '100%'
              "
            />
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import { type Ref, onMounted, watch, computed } from 'vue';
import { defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SearchGridView from '@/components/catalog/SearchGridView.vue';
import { type Pagination } from '@/models/pagination';
import { type Paginated } from '@/models/paginated';
import { onBeforeUnmount } from 'vue';
import SearchInput from '@/components/catalog/SearchInput.vue';
import Filters from '@/components/catalog/Filters.vue';
import SelectedFiltersBar from '@/components/catalog/SelectedFiltersBar.vue';
import { cloneDeep } from 'lodash';
import { type PropType } from 'vue';
import { type SearchFilters } from '@/models/search-filters';
import checkMobile from '@/utils/utils';
import { EntityType } from '@/models/resource-type';
import { loadRouteQueryParams, updateRouteQueryParams } from '@/utils/router-utils';
import CreateButton from '../common/CreateButton.vue';
import { type Asset } from '@/models/asset';
import assetService from '@/services/asset-service';
export default defineComponent({
  name: 'SearchComponent',
  components: { SearchGridView, SearchInput, Filters, SelectedFiltersBar, CreateButton },
  props: {
    title: {
      type: String,
    },
    icon: {
      type: String,
    },
    description: {
      type: String,
    },
    searchFilters: {
      type: Object as PropType<SearchFilters>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();

    const filters = ref(props.searchFilters);

    const items: Ref<Asset[]> = ref([]);
    const paginationOptions: Ref<Pagination> = ref({
      page: 1,
      size: 12,
      sort: [],
    });
    const reqController = new AbortController();
    const reqSignal = reqController.signal;

    const oldFilters = ref();

    const loading = ref(true);
    const isLastPage = ref(false);
    const totalItems = ref(0);
    const totalPages = ref(0);

    const isSticky = ref(false);
    const filtersBarWidth = ref(undefined);
    const headerBarWidth = ref(undefined);
    const headerHeight = ref(0);

    const filtersbarRef = ref();
    const contentRef = ref();
    const headerRef = ref();

    const searchFocused = ref(false);

    const isMobile = ref(checkMobile());

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
      setFilterBarWidth();
      loadQueryParams();
      searchFocused.value = Boolean(sessionStorage.getItem('searchFocus'));
    });

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScroll);
      reqController.abort();
    });

    const setFilterBarWidth = () => {
      if (filtersbarRef.value) {
        filtersBarWidth.value = filtersbarRef.value.offsetWidth;
        headerBarWidth.value = contentRef.value.offsetWidth;
        headerHeight.value = headerRef.value.offsetHeight;
      }
    };

    watch(
      () => filters.value,
      () => {
        if (
          oldFilters.value &&
          JSON.stringify(filters.value) !== JSON.stringify(oldFilters.value)
        ) {
          if (oldFilters.value && filters.value.query.value !== oldFilters.value.query.value) {
            sessionStorage.setItem('searchFocus', 'true');
          } else {
            sessionStorage.removeItem('searchFocus');
          }
          oldFilters.value = cloneDeep(filters.value);
          const queries = { ...route.query };
          for (const filter in filters.value) {
            if (filters.value[filter].value) {
              queries[filter] = filters.value[filter].value;
            } else {
              delete queries[filter];
            }
          }
          queries.page = '1';
          updateQueryParams(queries);
        }
      },
      { deep: true },
    );

    /* watch(
      () => paginationOptions.value.sort,
      (currentValue, oldValue) => {
        if (currentValue !== oldValue) {
          const queries = { ...route.query };
          queries.sort = paginationOptions.value.sort;
          router.replace({ query: queries });
          // reloadItems();
        }
      },
    ); */

    watch(
      () => paginationOptions.value.page,
      (currentValue, oldValue) => {
        if (currentValue !== oldValue) {
          const queries = { ...route.query };
          queries.page = paginationOptions.value.page.toString();
          updateQueryParams(queries);
        }
      },
    );

    const loadQueryParams = () => {
      loadRouteQueryParams(paginationOptions.value, filters.value);
      oldFilters.value = cloneDeep(filters.value);
      loadItems();
    };

    const updateQueryParams = (queries: SearchFilters) => {
      updateRouteQueryParams(queries);
      loadQueryParams();
    };

    const loadItems = async () => {
      reqController.abort();
      window.scrollTo(0, 0);
      items.value = [];
      isLastPage.value = false;
      loading.value = true;
      const searchFilters = {} as SearchFilters;
      for (const filter in filters.value) {
        searchFilters[filter] = filters.value[filter].value;
      }
      if (entityType.value) {
        searchFilters["type"] = entityType.value;
      }

      const response: Paginated<Asset> = await assetService.searchFederatedCatalog(
        undefined,
        paginationOptions.value,
        searchFilters,
        reqSignal,
      );
      if (response) {
        totalItems.value = response.totalElements;
        totalPages.value = response.totalPages;
        isLastPage.value = response.last;

        items.value = response.content;
      }
      loading.value = false;
    };

    const handleScroll = () => {
      isSticky.value = (window.scrollY || window.pageYOffset) > 100;
      setFilterBarWidth();
    };

    const entityType = computed(() => {
      if (route.name?.toString().includes('corpus')) {
        return EntityType.CORPUS;
      } else if (route.name?.toString().includes('service')) {
        return EntityType.SERVICE;
      } else if (route.name?.toString().includes('model')) {
        return EntityType.MODEL;
      } else if (route.name?.toString().includes('lexical-resource')) {
        return EntityType.LEXICAL_RESOURCE;
      }
      return null;
    });

    return {
      paginationOptions,
      isLastPage,
      items,
      loading,
      totalPages,
      isSticky,
      filters,
      filtersbarRef,
      filtersBarWidth,
      contentRef,
      headerBarWidth,
      headerRef,
      headerHeight,
      searchFocused,
      isMobile,
      entityType,
    };
  },
});
</script>

<style scoped lang="scss">
.sticky-header {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
  background-color: #fff;
  border-bottom: 1px solid $gray-light;
  margin-left: -45px;
  padding: 15px 45px;

  h1 {
    display: none;
  }

  .description {
    display: none;
  }

  &.mobile {
    margin-left: -70px;
  }
}
.description {
  font-size: 14px;
  color: $text-color-medium;
}

.filters-bar {
  width: 100%;
  // margin-top: -70px;
  & .sticky-filters {
    position: fixed;
    z-index: 100;
    background-color: #fff;
    top: 160px;
    right: 40px;
  }
}

.filters-bar-mobile {
  background-color: white;
}
</style>
@/models/resource-type @/models/asset @/services/asset-service
