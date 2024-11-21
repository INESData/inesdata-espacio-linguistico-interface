<template>
  <div>
    <v-data-table-server
      v-model:items-per-page="paginationOptions.size"
      v-model:page="paginationOptions.page"
      v-model:sort-by="paginationOptions.sort"
      :items-length="totalItems"
      :items="transfers"
      :loading="loading"
      item-value="name"
      @update:options="loadItems"
      :headers="headers"
      class="datatable"
    >
      <template v-slot:[`item.stateDate`]="{ item }">
        {{ new Date(item.stateDate).toLocaleString() }}
      </template>
      <template v-slot:[`item.status`]="{ item }">
        <v-chip
          :color="
            item.status === 'COMPLETED'
              ? 'success'
              : item.status === 'REFUSED'
              ? 'error'
              : 'warning'
          "
          class="ml-2"
        >
          {{ $t('console.negotiations-page.' + item.status) }}
        </v-chip>
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import { type Pagination } from '@/models/pagination';
import { type Ref } from 'vue';
import { ref } from 'vue';
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { type SearchFilters } from '@/models/search-filters';
import { FilterType } from '@/models/filter';
import { onMounted } from 'vue';
import { type Paginated } from '@/models/paginated';
import userService from '@/services/user-service';
import transferService from '@/services/transfer-service';
import { type Transfer } from '@/models/transfer';

export default defineComponent({
  name: 'TransfersConsumer',
  setup() {
    const transfers: Ref<Transfer[]> = ref([]);
    const { t } = useI18n();
    const headers: Ref<any> = ref([
      {
        title: t('console.id'),
        align: 'start',
        sortable: false,
        key: 'id',
      },
      {
        title: t('console.transfers-page.asset-id'),
        align: 'start',
        sortable: false,
        key: 'assetId',
      },
      {
        title: t('console.transfers-page.contract-id'),
        align: 'start',
        sortable: false,
        key: 'contractId',
      },
      {
        title: t('console.last-updated'),
        align: 'start',
        sortable: false,
        key: 'stateDate',
      },
      {
        title: t('console.status'),
        align: 'start',
        sortable: false,
        key: 'state',
      }
    ]);
    const filters: Ref<SearchFilters> = ref({
      query: {
        type: FilterType.SEARCH,
        value: '',
      },
    } as SearchFilters);
    const paginationOptions: Ref<Pagination> = ref({
      page: 1,
      size: 10,
      sort: [{key: 'createdAt', order: 'desc'}],
    });
    const totalItems = ref(0);
    const isLastPage = ref(false);
    const totalPages = ref(0);
    const reqController = new AbortController();
    const reqSignal = reqController.signal;
    const loading = ref(true);

    const loadItems = async () => {
      reqController.abort();
      transfers.value = [];
      isLastPage.value = false;
      loading.value = true;
      const searchFilters = {} as SearchFilters;
      for (const filter in filters.value) {
        searchFilters[filter] = filters.value[filter].value;
      }

      searchFilters.transferType = "CONSUMER";

      const response: Paginated<Transfer> = await transferService.search(
        userService.currentUser.id,
        paginationOptions.value,
        searchFilters,
        reqSignal,
      );
      if (response) {
        totalItems.value = response.totalElements;
        totalPages.value = response.totalPages;
        isLastPage.value = response.last;
        transfers.value = response.content;
      }
      loading.value = false;
    };

    onMounted(() => {
      loadItems();
    });

    return {
      transfers,
      paginationOptions,
      totalItems,
      isLastPage,
      totalPages,
      loading,
      loadItems,
      headers,
      filters,
    };
  },
});
</script>

<style scoped lang="scss">
.asset-type {
  font-size: 14px;
  color: $text-color-medium;
}
</style>
