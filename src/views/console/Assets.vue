<template>
  <router-view v-if="['asset-edit', 'asset-create'].includes($route.name as string)" />
  <template v-else>
    <div>
      <filters :filters="filters" button />
      <div class="mt-4" v-if="noContractAssetsCount > 0">
        <v-alert type="warning" variant="tonal">
          {{ $t('console.no-contract-assets-warning') }}
        </v-alert>
      </div>
      <v-data-table-server
        v-model:items-per-page="paginationOptions.size"
        v-model:page="paginationOptions.page"
        v-model:sort-by="paginationOptions.sort"
        :headers="headers"
        :items-length="totalItems"
        :items="items"
        :loading="loading"
        item-value="name"
        class="datatable"
      >
        <template v-slot:[`item.name`]="{ item }">
          <span class="name">
            <v-icon v-if="item.type === EntityType.CORPUS" icon="$folderTextOutline" />
            <v-icon v-else-if="item.type === EntityType.SERVICE" icon="$cogPlayOutline" />
            <v-icon v-else-if="item.type === EntityType.MODEL" icon="$axisArrow" />
            <v-icon v-else-if="item.type === EntityType.LEXICAL_RESOURCE" icon="$textBoxOutline" />
            <span class="ml-4">{{ item.name }}</span>
          </span>
        </template>
        <!--
        <template v-slot:[`item.contracts`]="{ item }">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <span class="contracts" v-bind="props">
                <span class="ml-4 underline">{{ item.contracts.length }}</span>
              </span>
            </template>

            <span v-for="contract in item.contracts" :key="contract.id">
              {{ contract.name }}
              <br />
            </span>
          </v-tooltip>
        </template>
        -->
        <template v-slot:[`item.creationDate`]="{ item }">
          {{ new Date(item.creationDate).toLocaleString() }}
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <div class="actions">
            <!--
            <v-tooltip :text="$t('console.no-contract-asset-warning')" location="top">
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  size="25"
                  class="warning mr-3"
                  v-if="!item.contracts.length"
                  icon="$alertCircle"
                />
              </template>
            </v-tooltip>
            -->

            <router-link
              :to="{
                name: 'asset-edit',
                params: {
                  type: item.type,
                  id: item.id,
                },
              }"
            >
              <v-btn variant="flat" density="comfortable" class="mr-1">
                <v-icon size="small" icon="$pencil"></v-icon>
              </v-btn>
            </router-link>
            <v-btn variant="flat" density="comfortable">
              <v-icon size="small" icon="$delete" @click="deleteItem(item)"></v-icon>
            </v-btn>
          </div>
        </template>
        <template v-slot:[`item.languages`]="{ item }">
          <span>{{ item.languages.map((l: Language) => l.name).join(', ') }}</span>
        </template>
        <template v-slot:[`item.categories`]="{ item }">
          <span>{{ item.categories.map((c: Category) => c.name).join(', ') }}</span>
        </template>
      </v-data-table-server>
    </div>

    <confirm-modal ref="confirmmodal" />
  </template>
</template>

<script lang="ts">
import { type Paginated } from '@/models/paginated';
import { type Pagination } from '@/models/pagination';
import { EntityType } from '@/models/resource-type';
import { type SearchFilters } from '@/models/search-filters';
import ConfirmModal, { type ConfirmModalExpose } from '@/components/common/Confirm.vue';
import { type Ref, defineComponent, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import { loadRouteQueryParams, updateRouteQueryParams } from '@/utils/router-utils';
import { useRoute } from 'vue-router';
import Filters from '@/components/console/Filters.vue';
import { FilterType } from '@/models/filter';
import { type Asset } from '@/models/asset';
import assetService from '@/services/asset-service';
import userService from '@/services/user-service';
import { type Language } from '@/models/language';
import { type Category } from '@/models/category';
import notifications from '@/utils/notifications';
import debounce from 'lodash.debounce';

export default defineComponent({
  name: 'AssetsView',
  components: { ConfirmModal, Filters },
  setup() {
    const { t } = useI18n();
    const headers: Ref<any> = ref([
      {
        title: t('console.name'),
        align: 'start',
        sortable: false,
        key: 'name',
      },
      {
        title: t('console.creation-date'),
        align: 'start',
        sortable: false,
        key: 'creationDate',
      },
      {
        title: t('console.languages'),
        align: 'start',
        sortable: false,
        key: 'languages',
      },
      {
        title: t('console.categories'),
        align: 'start',
        sortable: false,
        key: 'categories',
      },
      /*{
        title: t('console.contracts'),
        align: 'start',
        sortable: false,
        key: 'contracts',
      },*/
      { title: '', key: 'actions', sortable: false },
    ]);

    const loading = ref(true);
    const totalItems = ref(0);
    const isLastPage = ref(false);
    const totalPages = ref(0);

    const route = useRoute();

    const items: Ref<Asset[]> = ref([]);
    const paginationOptions: Ref<Pagination> = ref({
      page: 1,
      size: 10,
      sort: [],
    });
    const reqController = new AbortController();
    const reqSignal = reqController.signal;

    const loadingQueryParams = ref(true);
    const noContractAssetsCount = ref(0);

    const filters: Ref<SearchFilters> = ref({
      query: {
        type: FilterType.SEARCH,
        value: '',
      },
      type: {
        type: FilterType.SELECT,
        value: null,
        options: [
          {
            label: t('commons.' + EntityType.CORPUS + '.' + EntityType.CORPUS),
            value: EntityType.CORPUS,
          },
          {
            label: t('commons.' + EntityType.SERVICE + '.' + EntityType.SERVICE),
            value: EntityType.SERVICE,
          },
          {
            label: t('commons.' + EntityType.CONTRACT + '.' + EntityType.CONTRACT),
            value: EntityType.CONTRACT,
          },
          {
            label: t(
              'commons.' +
                EntityType.LEXICAL_RESOURCE.replace('_', '-') +
                '.' +
                EntityType.LEXICAL_RESOURCE.replace('_', '-'),
            ),
            value: EntityType.LEXICAL_RESOURCE,
          },
        ],
        label: t('console.asset-type'),
      },
    } as SearchFilters);

    const { notification } = notifications();

    onMounted(() => {
      loadQueryParams();
      loadItems();
    });

    const loadQueryParams = () => {
      loadRouteQueryParams(paginationOptions.value, []);
      loadingQueryParams.value = false;
    };

    watch(
      () => paginationOptions.value,
      () => {
        const queries = { ...route.query };
        queries.page = paginationOptions.value.page.toString();
        queries.size = paginationOptions.value.size.toString();
        queries.sort = paginationOptions.value.sort.toString();
        updateQueryParams(queries);
        loadItems();
      },
      { deep: true },
    );

    const updateQueryParams = (queries: SearchFilters) => {
      updateRouteQueryParams(queries, false);
    };

    watch(
      () => filters.value,
      debounce(() => {
        loadItems();
      }, 500),
      { deep: true },
    );

    const loadNoContractItems = async () => {
      const count: number = await assetService.getNoContractAssetsCount(
        userService.currentUser.id as string,
      );
      noContractAssetsCount.value = count;
    };

    const loadItems = async () => {
      reqController.abort();
      items.value = [];
      isLastPage.value = false;
      loading.value = true;

      const searchFilters = {} as SearchFilters;
      let assetType = null;
      for (const filter in filters.value) {
          searchFilters[filter] = filters.value[filter].value;
      }

      searchFilters.sortField = "createdAt"
      searchFilters.sortOrder = "DESC"

      const response: Paginated<Asset> = await assetService.search(
        userService.currentUser.id,
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
      loadNoContractItems();
      loading.value = false;
    };

    const confirmmodal: Ref<ConfirmModalExpose | null> = ref(null);
    const deleteItem = async (item: Asset) => {
      const confirm = await confirmmodal.value?.open({
        title: t('commons.operations.delete.title.single') + ' ' + item.name,
        message: t('commons.operations.delete.message.single'),
        hardconfirm: undefined,
      });
      if (confirm) {
        let sucess = await assetService.delete(item.id as string);
        if (sucess)
          notification.success({
            type: 'success',
            title: '',
            message: t('commons.operations.deleted'),
          });
        loadItems();
      }
    };

    return {
      paginationOptions,
      headers,
      items,
      loading,
      totalItems,
      loadItems,
      deleteItem,
      confirmmodal,
      EntityType,
      loadingQueryParams,
      filters,
      noContractAssetsCount,
    };
  },
});
</script>

<style scoped lang="scss">
//
</style>
