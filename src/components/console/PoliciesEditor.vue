<template>
  <div>
    <filters
      :filters="filters"
      :entityType="EntityType.CONTRACT"
      button
      @buttonItemClick="editItem()"
    />
    <v-data-table-server
      v-model:items-per-page="paginationOptions.size"
      v-model:page="paginationOptions.page"
      v-model:sort-by="paginationOptions.sort"
      :items-length="totalItems"
      :items="policies"
      :loading="loading"
      item-value="name"
      @update:options="loadItems"
      :headers="headers"
      class="datatable"
    >
      <template v-slot:[`item.name`]="{ item }">
        <span class="name" :class="{ deleted: item.deleted }">
          <span class="ml-4">{{ item.name }}</span>
        </span>
      </template>
      <template v-slot:[`item.creationDate`]="{ item }">
        {{ new Date(item.creationDate).toLocaleString() }}
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <div class="actions">
          <v-btn
            variant="flat"
            density="comfortable"
            class="mr-1"
            @click="showPolicyDetails(item.id, item.name, $t('commons.policy.contract-policy'))"
          >
            <v-icon size="small" icon="$eye"></v-icon>
          </v-btn>
          <template v-if="item.deleted">
            <v-chip class="ml-2 mr-2">{{ $t('commons.operations.deleted') }}</v-chip>
          </template>
          <template v-else>
            <v-btn variant="flat" density="comfortable" class="mr-1" @click="editItem(item)">
              <v-icon size="small" icon="$pencil"></v-icon>
            </v-btn>
            <v-btn variant="flat" density="comfortable" @click="deleteItem(item)">
              <v-icon size="small" icon="$delete"></v-icon>
            </v-btn>
          </template>
        </div>
      </template>
    </v-data-table-server>
    <policy-details-modal ref="policydetailsmodalRef" />
    <confirm-modal ref="confirmmodal" />
    <policy-editor-modal ref="policyeditormodalRef" @saved="loadItems" />
  </div>
</template>

<script lang="ts">
import { type Pagination } from '@/models/pagination';
import { onMounted, watch, type Ref } from 'vue';
import { ref } from 'vue';
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import Filters from '@/components/console/Filters.vue';
import { type SearchFilters } from '@/models/search-filters';
import { FilterType } from '@/models/filter';
import { type Policy } from '@/models/policy';
import userService from '@/services/user-service';
import policyService from '@/services/policy-service';
import { type Paginated } from '@/models/paginated';
import PolicyDetailsModal from '@/components/common/PolicyDetailsModal.vue';
import ConfirmModal, { type ConfirmModalExpose } from '@/components/common/Confirm.vue';
import PolicyEditorModal from './PolicyEditorModal.vue';
import { EntityType } from '@/models/resource-type';
import notifications from '@/utils/notifications';
import debounce from 'lodash.debounce';

export default defineComponent({
  name: 'PoliciesEditor',
  components: { Filters, PolicyDetailsModal, ConfirmModal, PolicyEditorModal },
  setup() {
    const policies: Ref<Policy[]> = ref([]);
    const policydetailsmodalRef = ref();

    onMounted(() => {
      loadItems();
    });

    const loadItems = async () => {
      reqController.abort();
      policies.value = [];
      isLastPage.value = false;
      loading.value = true;
      const searchFilters = {} as SearchFilters;
      for (const filter in filters.value) {
        searchFilters[filter] = filters.value[filter].value;
      }
      
      const response: Paginated<Policy> = await policyService.search(
        userService.currentUser.id,
        paginationOptions.value,
        searchFilters,
        reqSignal,
      );
      if (response) {
        totalItems.value = response.totalElements;
        totalPages.value = response.totalPages;
        isLastPage.value = response.last;

        policies.value = response.content;
      }
      loading.value = false;
    };
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

    const policyeditormodalRef = ref();
    const { notification } = notifications();

    watch(
      () => filters.value,
      debounce(() => {
        loadItems();
      }, 500),
      { deep: true },
    );

    const editItem = (item?: Policy) => {
      policyeditormodalRef.value.show(item);
    };

    const confirmmodal: Ref<ConfirmModalExpose | null> = ref(null);
    const deleteItem = async (item: Policy) => {
      const confirm = await confirmmodal.value?.open({
        title: t('commons.operations.delete.title.single') + ' ' + item.name,
        message: t('commons.operations.delete.message.single'),
        hardconfirm: undefined,
      });
      if (confirm) {
        let sucess = await policyService.delete(item.id as string);
        if (sucess)
          notification.success({
            type: 'success',
            title: '',
            message: t('commons.operations.deleted'),
          });
        loadItems();
      }
    };

    const showPolicyDetails = (id: number, title: string, subtitle: string) => {
      policydetailsmodalRef.value.show(id, title, subtitle);
    };

    return {
      policies,
      paginationOptions,
      totalItems,
      isLastPage,
      totalPages,
      loading,
      loadItems,
      headers,
      editItem,
      deleteItem,
      filters,
      showPolicyDetails,
      policydetailsmodalRef,
      confirmmodal,
      policyeditormodalRef,
      EntityType,
    };
  },
});
</script>

<style scoped lang="scss">
.name.deleted {
  text-decoration: line-through;
  opacity: 0.5;
}
</style>
