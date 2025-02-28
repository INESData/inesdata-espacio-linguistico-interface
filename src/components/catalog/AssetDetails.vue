<template>
  <div class="badges mb-9">
    <v-row>
      <v-col cols="9">
        <v-chip class="mr-2" variant="outlined" prepend-icon="$flag">
          {{ $props.asset?.languages.map((l) => $t('catalog.filters.languages.options.' + (l as Language).name)).join(', ') }}
        </v-chip>
        <v-chip class="mr-2" variant="outlined" prepend-icon="$shapeOutline">
          {{ $props.asset?.categories.map((c) => c.name).join(', ') }}
        </v-chip>
        <v-chip class="mr-2" variant="outlined" prepend-icon="$accountOutline" v-if="$props.asset?.user">
          {{ $props.asset?.user?.username }}
        </v-chip>
      </v-col>
      <v-col cols="3" class="text-right">
        <v-btn v-if="asset?.contractOffers?.length == 1" class="primary" size="large"
          @click="negotiateContract(asset?.contractOffers[0])">
          {{ $t('commons.buttons.negotiate') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="9">
        <div style="padding: 2px 0;">
          <v-icon icon="$fileDocumentOutline" />
          <span style="padding: 0 5px;">{{ $t('console.version') }}:</span>
          <span style="font-size: 14px;">{{ $props.asset?.version }}</span>
        </div>
        <div style="padding: 2px 0;">
          <v-icon icon="$link" />
          <span style="padding: 0 5px;">{{ $t('catalog.originator') }}:</span>
          <span style="font-size: 14px;">{{ $props.asset?.originator }}</span>
        </div>
        <div style="padding: 2px 0;">
          <v-icon icon="$contentPaste" />
          <span style="padding: 0 5px;">{{ $t('console.content-type') }}:</span>
          <span style="font-size: 14px;">{{ $props.asset?.contenttype }}</span>
        </div>        
      </v-col>
    </v-row>
  </div>
  <teleport to="#tabs-header-slot" v-if="isMounted" :disabled="!$props.isSticky">
    <div class="tabs">
      <v-btn :variant="selectedTab === 1 ? 'tonal' : 'text'" @click="selectedTab = 1">
        {{ $t('catalog.overview') }}
      </v-btn>
      <!--
      <v-btn :variant="selectedTab === 2 ? 'tonal' : 'text'" @click="selectedTab = 2">
        {{ $t('catalog.contents') }}
      </v-btn>
      -->
      <v-btn :variant="selectedTab === 3 ? 'tonal' : 'text'" @click="selectedTab = 3">
        {{ $t('catalog.contracts') }}
      </v-btn>
    </div>
  </teleport>
  <div v-if="selectedTab === 1">
    <v-container fluid>
      <v-row>
        <v-col cols="8">
          <p>
            {{ asset?.textContent }}
          </p>
        </v-col>
        <!-- <v-col cols="4">
          <div class="mt-5">
            <v-card
              title="Info title"
              subtitle="Info subtitle"
              text="Info content"
              class="mb-5"
            ></v-card>
            <v-card
              title="Info title"
              subtitle="Info subtitle"
              text="Info content"
              class="mb-5"
            ></v-card>
          </div>
        </v-col> -->
      </v-row>
    </v-container>
  </div>
  <div v-else-if="selectedTab === 2">
    <v-container fluid>
      <v-list lines="two" max-width="500">
        <v-list-item
          v-for="content in asset?.contents"
          :key="content.id"
          :title="content.name"
          class="content-item mb-1"
        >
          <template v-slot:prepend>
            <v-avatar color="grey-lighten-1">
              <v-icon color="white" icon="$file"></v-icon>
            </v-avatar>
          </template>
        </v-list-item>
      </v-list>
    </v-container>
  </div>
  <div v-else-if="selectedTab === 3">
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="4" v-for="(contract, index) in asset?.contractOffers" :key="contract.id">
          <v-card class="mt-5 mb-5">
            <template v-slot:title>
              <!--{{ contract.name }}-->
               Contract Offer {{ index+1 }}
            </template>
            <v-card-text>
              <div class="contract-info mt-2">
                <v-divider />

                <v-list-item class="mt-2 mb-2" :disabled="contract.permission == '[]'">
                  <template v-slot:prepend>
                    <v-icon icon="$license"></v-icon>
                  </template>
                  <template v-slot:title>
                    {{ $t('console.policy-permissions') }}
                  </template>
                  <template v-slot:append>
                    <v-btn
                      variant="flat"
                      density="comfortable"
                      v-if="contract.permission"
                      @click="
                        showPolicyDetails(
                          $t('console.policy-permissions'),
                          contract.permission,
                        )
                      "
                    >
                      <v-icon icon="$eye"></v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
                <v-divider />
                <v-list-item class="mt-2 mb-2" :disabled="contract.prohibition == '[]'">
                  <template v-slot:prepend>
                    <v-icon icon="$license"></v-icon>
                  </template>
                  <template v-slot:title>
                    {{ $t('console.policy-prohibitions') }}
                  </template>
                  <template v-slot:append>
                    <v-btn
                      variant="flat"
                      density="comfortable"
                      v-if="contract.prohibition"
                      @click="
                        showPolicyDetails(
                          $t('console.policy-prohibitions'),
                          contract.prohibition,
                        )
                      "
                    >
                      <v-icon icon="$eye"></v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
                <v-list-item class="mt-2 mb-2" :disabled="contract.obligation == '[]'">
                  <template v-slot:prepend>
                    <v-icon icon="$license"></v-icon>
                  </template>
                  <template v-slot:title>
                    {{ $t('console.policy-obligations') }}
                  </template>
                  <template v-slot:append>
                    <v-btn
                      variant="flat"
                      density="comfortable"
                      v-if="contract.obligation"
                      @click="
                        showPolicyDetails(
                          $t('console.policy-obligations'),
                          contract.obligation,
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
              <v-btn class="primary w-100" size="large" @click="negotiateContract(contract)">
                {{ $t('commons.buttons.negotiate') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <policy-details-field-modal ref="policydetailsfieldmodalRef" />
    </v-container>
  </div>
</template>

<script lang="ts">
import { type Asset } from '@/models/asset';
import { type Language } from '@/models/language';
import { onMounted } from 'vue';
import { type PropType, ref } from 'vue';
import { defineComponent } from 'vue';
import PolicyDetailsFieldModal from '@/components/common/PolicyDetailsFieldModal.vue';
import assetService from '@/services/asset-service';
import { useRouter } from 'vue-router';
import type { ContractOffer } from '@/models/contract-offer';
import notifications from '@/utils/notifications';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'AssetDetails',
  components: { PolicyDetailsFieldModal },
  props: {
    asset: {
      type: Object as PropType<Asset>,
    },
    isSticky: {
      type: Boolean,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const selectedTab = ref(1);
    const isMounted = ref(false);
    const policydetailsfieldmodalRef = ref();
    onMounted(async () => {
      isMounted.value = true;
    });
    const showPolicyDetails = (title: string, text: string) => {
      policydetailsfieldmodalRef.value.show(title, text);
    };

    const { notification } = notifications();
    const router = useRouter();

    async function negotiateContract(contractOffer: ContractOffer) {
      
      let sucess = await assetService.negotiate(
        props.asset!.id!,
        props.asset!.participantId!,
        contractOffer,
        props.asset!.originator!
      );

      if (sucess) {

        router.push({ name: 'negotiations' });

        notification.success({
          type: 'success',
          title: '',
          message: t('commons.operations.created'),
        });
      }
    };

    return { selectedTab, isMounted, policydetailsfieldmodalRef, showPolicyDetails, negotiateContract };
  },
});
</script>

<style scoped lang="scss">
.badges {
  & .v-chip {
    color: $secondary-color;
  }
}

.content-item {
  border: 1px solid $gray-light;
}
</style>
