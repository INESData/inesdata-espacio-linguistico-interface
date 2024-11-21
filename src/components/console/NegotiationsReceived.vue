<template>
  <div>
    <v-data-table-server
      v-model:items-per-page="paginationOptions.size"
      v-model:page="paginationOptions.page"
      v-model:sort-by="paginationOptions.sort"
      :items-length="totalItems"
      :items="negotiations"
      :loading="loading"
      item-value="name"
      @update:options="loadItems"
      :headers="headers"
      class="datatable"
    >
      <template v-slot:[`item.asset`]="{ item }">
        <span class="name" v-if="item.contractAgreement">
          <span>{{ item.contractAgreement.asset.name }}</span>
          <span class="asset-type">
            {{ ' (' + $t('commons.' + item.contractAgreement.asset.type + '.' + item.contractAgreement.asset.type) + ')' }}
          </span>
        </span>
      </template>
      <template v-slot:[`item.creationDate`]="{ item }">
        {{ new Date(item.creationDate).toLocaleString() }}
      </template>
      <template v-slot:[`item.status`]="{ item }">
        <v-chip
          :color="
            item.status === NegotiationType.COMPLETED
              ? 'success'
              : item.status === NegotiationType.REFUSED
              ? 'error'
              : 'warning'
          "
          class="ml-2"
        >
          {{ $t('console.negotiations-page.' + item.status) }}
        </v-chip>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <div class="actions">
          <v-btn variant="flat" density="comfortable" @click="showDetails(item)">
            <v-icon icon="$eye"></v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table-server>
    <negotiation-modal ref="negotiationmodalref" @accepted="loadItems()" @refused="loadItems()" />
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
import { type Negotiation } from '@/models/negotiation';
import userService from '@/services/user-service';
import negotiationService from '@/services/negotiation-service';
import { NegotiationType } from '@/models/negotiation-type';
import NegotiationModal from './NegotiationModal.vue';

export default defineComponent({
  name: 'NegotiationsReceived',
  components: { NegotiationModal },
  setup() {
    const negotiations: Ref<Negotiation[]> = ref([]);
    const { t } = useI18n();
    const headers: Ref<any> = ref([
      {
        title: t('console.id'),
        align: 'start',
        sortable: false,
        key: 'id',
      },
      {
        title: t('console.asset-name'),
        align: 'start',
        sortable: false,
        key: 'asset',
      },
      /*{
        title: t('console.acquirer'),
        align: 'start',
        sortable: false,
        key: 'assetOwner.username',
      },*/
      {
        title: t('console.creation-date'),
        align: 'start',
        sortable: false,
        key: 'creationDate',
      },
      {
        title: t('console.status'),
        align: 'start',
        sortable: false,
        key: 'status',
      },
      { title: '', key: 'actions', sortable: false },
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
    const negotiationmodalref = ref();

    const loadItems = async () => {
      reqController.abort();
      negotiations.value = [];
      isLastPage.value = false;
      loading.value = true;
      const searchFilters = {} as SearchFilters;
      for (const filter in filters.value) {
        searchFilters[filter] = filters.value[filter].value;
      }

      searchFilters.negotiationType = "PROVIDER";
      
      const response: Paginated<Negotiation> = await negotiationService.search(
        userService.currentUser.id,
        paginationOptions.value,
        searchFilters,
        reqSignal,
      );
      if (response) {
        totalItems.value = response.totalElements;
        totalPages.value = response.totalPages;
        isLastPage.value = response.last;
        negotiations.value = response.content;
      }
      loading.value = false;
    };

    const showDetails = (item: Negotiation) => {
      negotiationmodalref.value.show(item.id);
    };

    onMounted(() => {
      loadItems();
    });

    return {
      negotiations,
      paginationOptions,
      totalItems,
      isLastPage,
      totalPages,
      loading,
      loadItems,
      headers,
      showDetails,
      filters,
      NegotiationType,
      negotiationmodalref,
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
