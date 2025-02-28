<template>
    <v-dialog v-model="dialogs.show" width="750">
      <v-card :title="$t('console.transfers-page.execute-service-title')">
        <v-card-text>

            <v-text-field
                :label="$t('console.transfers-page.service-endpoint')"
                variant="outlined"
                v-model="serviceEnpointSuffix"
                :prefix="serviceAssetEnpoint"
            />

            <v-textarea
              :label="$t('console.transfers-page.service-request')"
              variant="outlined"
              density="compact"
              autocomplete="off"
              v-model="serviceRequest"
              rows="4"
              no-resize
              id="input-service-request"
            />

            <v-btn
              class="primary mr-2"
              @click="executeServiceRequest()"
            >
                {{ $t('commons.buttons.execute') }}
            </v-btn>

          <v-card-item v-if="serviceExecutionInProgress" style="margin-bottom: 20px;">
            <v-progress-linear
              color="yellow-darken-2"
              indeterminate
            />
          </v-card-item>

          <div class="service-execution-viewer">
              <pre>{{ serviceResponse }}</pre>
          </div>
        </v-card-text>
  
        <v-card-actions>
          <v-spacer></v-spacer>
  
          <v-btn :text="$t('commons.buttons.close')" @click="dialogs.show = false"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts">
  import { ContractAgreement } from '@/models/contract-agreement';
  import transferService from '@/services/transfer-service';
  import { type Ref, defineComponent, ref } from 'vue';
  
  type ViewDialogs = {
    show: boolean;
  };
  
  export default defineComponent({
    name: 'ExecuteServiceModal',
    components: {},
    emits: ['create:success', 'create:error', 'update:success', 'update:error'],
    setup(props, { emit }) {
      const dialogs: Ref<ViewDialogs> = ref({
        show: false,
      });
      const loading = ref(true);

      const serviceExecutionInProgress = ref(false);

      const contractAgreementId = ref('');
      const assetId = ref('');
      const consumerId = ref('');
      const negotationCounterPartyAddress = ref('');
      const serviceAssetEnpoint = ref('');
      const serviceEnpointSuffix = ref('');
      const serviceRequest = ref('');
      const serviceResponse = ref('');
  
      const show = async (contractAgreement: ContractAgreement, counterPartyAddress: string) => {
        loading.value = true;
        serviceExecutionInProgress.value = false;
        serviceResponse.value = "";
        contractAgreementId.value = contractAgreement.id;
        assetId.value = contractAgreement.asset.id!;
        consumerId.value = contractAgreement.consumerId;
        negotationCounterPartyAddress.value = counterPartyAddress;
        serviceAssetEnpoint.value = contractAgreement.asset.serviceEndpoint!;
        if (serviceAssetEnpoint.value && !serviceAssetEnpoint.value.endsWith("/"))
          serviceAssetEnpoint.value += "/";
        dialogs.value.show = true;
        loading.value = false;
      };

      const executeServiceRequest = async() => {

        serviceExecutionInProgress.value = true;

        const transfer = await transferService.startTransfer(
          contractAgreementId.value,
          assetId.value,
          consumerId.value,
          negotationCounterPartyAddress.value
        );

        if (transfer["@id"]) {

          await new Promise(resolve => setTimeout(resolve, 2000));

          const response = await transferService.executeServiceRequest(transfer["@id"], serviceEnpointSuffix.value, serviceRequest.value);

          if (response) {
            await transferService.terminateTransfer(transfer["@id"]);

            serviceResponse.value = JSON.stringify(response, null, 2);
          }
        }

        serviceExecutionInProgress.value = false;
      };
  
      const hide = () => {
        dialogs.value.show = false;
      };
  
      return {
        dialogs,
        show,
        hide,
        serviceAssetEnpoint,
        serviceEnpointSuffix,
        serviceRequest,
        serviceResponse,
        executeServiceRequest,
        serviceExecutionInProgress
      };
    },
  });
  </script>
  
  <style scoped lang="scss">
  .service-execution-viewer {
    width: 100%;
    min-height: 200px;
    background-color: rgb(25, 25, 25, 0.8);
    color: white;
    border-radius: $border-radius;
    padding: 5px 5px;
    margin-top: 20px;
  }
  </style>
  