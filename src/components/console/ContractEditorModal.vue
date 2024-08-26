<template>
  <v-dialog v-model="dialogs.show" width="750">
    <v-overlay
      v-model="loading"
      contained
      class="align-center justify-center"
      persistent
      :scrim="'transparent'"
    >
      <v-progress-circular :size="50" class="primary" indeterminate></v-progress-circular>
    </v-overlay>
    <v-form v-model="isFormValid" @submit.prevent="submit" ref="form">
      <v-card :title="$t('console.contracts-page.contract-editor')">
        <v-card-text>
          <div class="mt-5">
            <v-text-field
              :label="$t('console.name')"
              :rules="[rules.required, rules.min]"
              variant="outlined"
              density="compact"
              autocomplete="off"
              v-model.trim="contract.name"
              class="mb-3"
            ></v-text-field>
            <v-select
              variant="outlined"
              density="compact"
              v-model="contract.contractPolicy"
              :items="filteredContractPolicies"
              :label="$t('commons.policy.contract-policy')"
              return-object
              item-title="name"
              :rules="[rules.required]"
            >
              <template v-slot:prepend-item>
                <div class="pa-2">
                  <v-text-field
                    class="ma-0 pa-0"
                    variant="outlined"
                    density="compact"
                    autocomplete="off"
                    prepend-inner-icon="$magnify"
                    hide-details
                    v-model="searchCP"
                  ></v-text-field>
                </div>
              </template>
            </v-select>
            <v-select
              variant="outlined"
              density="compact"
              v-model="contract.accessPolicy"
              :items="filteredAccessPolicies"
              :label="$t('commons.policy.access-policy')"
              return-object
              item-title="name"
              :rules="[rules.required]"
            >
              <template v-slot:prepend-item>
                <div class="pa-2">
                  <v-text-field
                    class="ma-0 pa-0"
                    variant="outlined"
                    density="compact"
                    autocomplete="off"
                    prepend-inner-icon="$magnify"
                    hide-details
                    v-model="searchAP"
                  ></v-text-field>
                </div>
              </template>
            </v-select>
          </div>

          <div class="mt-5">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props">
                  {{ $t('console.operations.select-assets') }}
                  <template v-slot:append>
                    <v-icon size="25" icon="$menuDown"></v-icon>
                  </template>
                </v-btn>
              </template>
              <v-list class="pa-2">
                <template v-for="asset in allAssets">
                  <v-list-item
                    :key="asset.id"
                    v-if="!contract.assets.find((a) => a.id === asset.id)"
                    :title="asset.name"
                    :active="false"
                    @click="contract.assets.push(asset)"
                  >
                    <p class="asset-info">
                      {{ asset.description }}
                    </p>
                  </v-list-item>
                </template>
              </v-list>
            </v-menu>

            <v-list class="mt-5">
              <v-list-item
                v-for="asset in contract.assets"
                :key="asset.id"
                class="asset-item"
              >
                <template v-slot:prepend>
                  <v-icon v-if="asset.type === EntityType.CORPUS" icon="$folderTextOutline" />
                  <v-icon v-else-if="asset.type === EntityType.SERVICE" icon="$cogPlayOutline" />
                  <v-icon v-else-if="asset.type === EntityType.MODEL" icon="$axisArrow" />
                  <v-icon v-else-if="asset.type === EntityType.LEXICAL_RESOURCE" icon="$textBoxOutline" />
                </template>
                <template v-slot:title>
                  {{ asset.name }}
                </template>
                <template v-slot:append>
                  <v-btn
                    variant="flat"
                    @click="contract.assets = contract.assets.filter((a) => a.id !== asset.id)"
                  >
                    <v-icon icon="$close"></v-icon>
                  </v-btn>
                </template>

                <p class="asset-info">
                  {{ asset.description }}
                </p>
              </v-list-item>
            </v-list>
          </div>

        </v-card-text>

        <v-card-actions class="pa-4 pl-5 pr-5">
          <v-btn class="gray" @click="hide" :density="'default'">
            {{ $t('commons.buttons.cancel') }}
          </v-btn>
          <v-spacer></v-spacer>

          <v-btn class="primary" :density="'default'" type="submit">
            {{ $t('commons.buttons.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import { type Contract } from '@/models/contract';
import { type Paginated } from '@/models/paginated';
import { type Policy } from '@/models/policy';
import { type Asset } from '@/models/asset';
import { EntityType } from '@/models/resource-type';
import { PolicyType } from '@/models/policy-type';
import { type ValidationRule } from '@/models/validationRule';
import contractService from '@/services/contract-service';
import policyService from '@/services/policy-service';
import userService from '@/services/user-service';
import notifications from '@/utils/notifications';
import { type Ref, defineComponent, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import assetService from '@/services/asset-service';

type ViewDialogs = {
  show: boolean;
};

export default defineComponent({
  name: 'ContractEditorModal',
  components: {},
  emits: ['saved'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const dialogs: Ref<ViewDialogs> = ref({
      show: false,
    });
    const loading = ref(true);
    const contract: Ref<Contract> = ref({
      name: '',
      accessPolicy: null,
      contractPolicy: null,
    } as Contract);

    const contractPolicies: Ref<Policy[]> = ref([]);
    const accessPolicies: Ref<Policy[]> = ref([]);
    const searchAP = ref('');
    const searchCP = ref('');

    const allAssets: Ref<Asset[]> = ref([]);

    const form = ref();
    const { notification } = notifications();

    const show = async (contractToEdit: Contract) => {
      loading.value = true;
      contract.value = {
        name: '',
        accessPolicy: null,
        contractPolicy: null,
        assets: [],
        creationDate: 0,
      };
      contractPolicies.value = [];
      accessPolicies.value = [];
      const response: Paginated<Policy> = await policyService.search(
        userService.currentUser.id,
        undefined,
        {},
        undefined,
      );
      if (response) {
        const policies = response.content;
        contractPolicies.value = policies.filter((p) => p.type === PolicyType.CONTRACT);
        accessPolicies.value = policies.filter((p) => p.type === PolicyType.ACCESS);
      }

      allAssets.value = [];
      const assetsResponse: Paginated<Asset> = await assetService.readAll();
      if (assetsResponse) {
        allAssets.value = assetsResponse.content;
      }

      if (contractToEdit) {
        contract.value = await contractService.read(contractToEdit.id as string);
      } else {
        contract.value = {
          name: '',
          accessPolicy: null,
          contractPolicy: null,
          assets: [],
          creationDate: 0,
        };
      }
      dialogs.value.show = true;
      loading.value = false;
    };

    const hide = () => {
      dialogs.value.show = false;
    };

    const filteredAccessPolicies = computed(() => {
      return accessPolicies.value.filter((p) =>
        p.name.toLowerCase().includes(searchAP.value.toLowerCase()),
      );
    });

    const filteredContractPolicies = computed(() => {
      return contractPolicies.value.filter((p) =>
        p.name.toLowerCase().includes(searchCP.value.toLowerCase()),
      );
    });

    const isFormValid: Ref<boolean> = ref(true);
    const rules: Ref<{ [key: string]: ValidationRule }> = ref({
      required: (value: string) => !!value || t('commons.errors.required'),
      min: (value: string) =>
        (value && value.length >= 1) || t('commons.errors.field-too-short', { length: 1 }),
    });
    async function submit() {
      await form.value?.validate();
      if (isFormValid.value) {
        let succes = true;
        if (contract.value.id) {
          succes = await contractService.update('', contract.value);
        } else {
          const newContract:any = await contractService.create(contract.value);
          if (!newContract["@id"])
            succes = false;
        }

        loading.value = false;
        hide();

        if (succes)
          notification.success({
            type: 'success',
            title: '',
            message: contract.value.id
              ? t('commons.operations.updated')
              : t('commons.operations.created'),
          });
        emit('saved');
      }
    }

    return {
      dialogs,
      show,
      hide,
      contract,
      submit,
      rules,
      isFormValid,
      loading,
      contractPolicies,
      accessPolicies,
      searchCP,
      searchAP,
      filteredAccessPolicies,
      filteredContractPolicies,
      allAssets,
      EntityType
    };
  },
});
</script>

<style scoped lang="scss">
.policy-editor :deep(.v-field__field) {
  width: 100%;
  min-height: 200px;
  // background-color: rgb(25, 25, 25, 0.8);
  // color: white;
  border-radius: $border-radius;
  padding: 5px 5px;
}

.asset-item {
  border: 1px solid $gray-light;
  margin-bottom: 5px;
}
.asset-info {
  color: $text-color-medium;
  font-size: 13px;
}
</style>
