<template>
  <div>
    <filters
      :filters="filters"
      :entityType="EntityType.CONTRACT"
      button
      @buttonItemClick="editItem()"
    />
    <v-row class="datatable">
      <v-col cols="12" md="4" v-for="contract in contracts" :key="contract.id">
        <v-card
          class="mt-5 mb-5"
          :class="{ warning: !contract.contractPolicy || !contract.accessPolicy }"
        >
          <template v-slot:title>
            {{ contract.name }}
          </template>
          <!-- <template v-slot:subtitle>
            {{ new Date(contract.creationDate).toLocaleString() }}
          </template> -->
          <v-card-text>
            <div class="contract-info mt-2">
              <v-divider />
              <v-list-item :subtitle="$t('commons.policy.contract-policy')" class="mt-2 mb-2">
                <template v-slot:prepend>
                  <v-icon icon="$license" v-if="contract.contractPolicy"></v-icon>
                  <v-icon v-else class="warning" icon="$alertCircle"></v-icon>
                </template>
                <template v-slot:title>
                  {{ contract.contractPolicy ? contract.contractPolicy.name : '-' }}
                </template>
                <template v-slot:append v-if="contract.contractPolicy">
                  <v-btn
                    variant="flat"
                    density="comfortable"
                    @click="
                      showPolicyDetails(
                        contract.contractPolicy.id as string,
                        contract.contractPolicy.name,
                        $t('commons.policy.contract-policy'),
                      )
                    "
                  >
                    <v-icon icon="$eye"></v-icon>
                  </v-btn>
                </template>
              </v-list-item>
              <v-divider />
              <v-list-item :subtitle="$t('commons.policy.access-policy')" class="mt-2 mb-2">
                <template v-slot:prepend>
                  <v-icon icon="$license" v-if="contract.accessPolicy"></v-icon>
                  <v-icon v-else class="warning" icon="$alertCircle"></v-icon>
                </template>
                <template v-slot:title>
                  {{ contract.accessPolicy ? contract.accessPolicy.name : '-' }}
                </template>
                <template v-slot:append v-if="contract.accessPolicy">
                  <v-btn
                    variant="flat"
                    density="comfortable"
                    @click="
                      showPolicyDetails(
                        contract.accessPolicy.id as string,
                        contract.accessPolicy.name,
                        $t('commons.policy.access-policy'),
                      )
                    "
                  >
                    <v-icon icon="$eye"></v-icon>
                  </v-btn>
                </template>
              </v-list-item>
              <v-divider />
            </div>
          </v-card-text>
          <v-card-actions>
            <v-list-item class="w-100 pa-0">
              <template v-slot:prepend>
                <contract-assets-count :contractId="(contract.id as string)" />
              </template>
              <div class="actions text-right w-100 pr-3 pb-2">
                <v-btn variant="flat" @click="editItem(contract)">
                  <v-icon icon="$pencil"></v-icon>
                </v-btn>

                <v-btn variant="flat" @click="deleteItem(contract)">
                  <v-icon icon="$delete"></v-icon>
                </v-btn>
              </div>
            </v-list-item>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-pagination @update:model-value="loadItems" v-model="paginationOptions.page" :length="totalPages" rounded="0" />
    <policy-details-modal ref="policydetailsmodalRef" />
    <confirm-modal ref="confirmmodal" />
    <contract-editor-modal ref="contracteditormodalRef" @saved="loadItems" />
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
import { type Contract } from '@/models/contract';
import contractService from '@/services/contract-service';
import userService from '@/services/user-service';
import { type Paginated } from '@/models/paginated';
import PolicyDetailsModal from '@/components/common/PolicyDetailsModal.vue';
import ContractAssetsCount from '@/components/console/ContractAssetsCount.vue';
import ConfirmModal, { type ConfirmModalExpose } from '@/components/common/Confirm.vue';
import ContractEditorModal from './ContractEditorModal.vue';
import { EntityType } from '@/models/resource-type';
import notifications from '@/utils/notifications';
import debounce from 'lodash.debounce';

export default defineComponent({
  name: 'ContractsEditor',
  components: {
    Filters,
    PolicyDetailsModal,
    ContractAssetsCount,
    ConfirmModal,
    ContractEditorModal,
  },
  setup() {
    const contracts: Ref<Contract[]> = ref([]);
    const policydetailsmodalRef = ref();
    const { notification } = notifications();

    onMounted(() => {
      loadItems();
    });

    const loadItems = async () => {
      reqController.abort();
      contracts.value = [];
      isLastPage.value = false;
      loading.value = true;
      const searchFilters = {} as SearchFilters;
      for (const filter in filters.value) {
        searchFilters[filter] = filters.value[filter].value;
      }
      const response: Paginated<Contract> = await contractService.search(
        userService.currentUser.id,
        paginationOptions.value,
        searchFilters,
        reqSignal,
      );
      if (response) {
        totalItems.value = response.totalElements;
        totalPages.value = response.totalPages;
        isLastPage.value = response.last;
        contracts.value = response.content;
      }
      loading.value = false;
    };
    const { t } = useI18n();
    const filters: Ref<SearchFilters> = ref({
      query: {
        type: FilterType.SEARCH,
        value: '',
      },
    } as SearchFilters);
    const paginationOptions: Ref<Pagination> = ref({
      page: 1,
      size: 6,
      sort: [/*{ key:'createdAt', order:'DESC' }*/],
    });
    const totalItems = ref(0);
    const isLastPage = ref(false);
    const totalPages = ref(0);
    const reqController = new AbortController();
    const reqSignal = reqController.signal;
    const loading = ref(true);

    watch(
      () => filters.value,
      debounce(() => {
        loadItems();
      }, 500),
      { deep: true },
    );

    const contracteditormodalRef = ref();
    const editItem = (item?: Contract) => {
      contracteditormodalRef.value.show(item);
    };

    const confirmmodal: Ref<ConfirmModalExpose | null> = ref(null);
    const deleteItem = async (item: Contract) => {
      const confirm = await confirmmodal.value?.open({
        title: t('commons.operations.delete.title.single') + ' ' + item.name,
        message: t('commons.operations.delete.message.single'),
        hardconfirm: undefined,
      });
      if (confirm) {
        let sucess = await contractService.delete(item.id as string);
        if (sucess)
          notification.success({
            type: 'success',
            title: '',
            message: t('commons.operations.deleted'),
          });
        loadItems();
      }
    };

    const showPolicyDetails = (id: string, title: string, subtitle: string) => {
      policydetailsmodalRef.value.show(id, title, subtitle);
    };

    return {
      contracts,
      paginationOptions,
      totalItems,
      isLastPage,
      totalPages,
      loading,
      loadItems,
      editItem,
      deleteItem,
      filters,
      contractService,
      showPolicyDetails,
      policydetailsmodalRef,
      confirmmodal,
      contracteditormodalRef,
      EntityType,
    };
  },
});
</script>

<style scoped lang="scss">
.contract-info {
  & > p {
    color: $text-color-medium;
  }
}

p.nr-assets {
  padding-left: 15px;
  color: $text-color-light;
  text-decoration: underline;
}
</style>
