<template>
  <v-dialog v-model="dialogs.show" width="750">
    <template v-if="negotiation">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 text-medium-emphasis ps-2">
            {{
              $t('console.negotiations-page.negotiation-modal.title', {
                id: negotiation.id,
              })
            }}
          </div>

          <v-btn icon="$close" variant="text" @click="hide()"></v-btn>
        </v-card-title>
        <v-card-text>
          <div class="mt-5">
            <v-row>
              <v-col cols="6">
                <v-list lines="one">
                  <v-list-item
                    v-if="isReceived"
                    :title="negotiation.counterPartyId"
                    :subtitle="$t('console.acquirer')"
                  ></v-list-item>
                  <v-list-item
                    v-else
                    :title="negotiation.counterPartyId"
                    :subtitle="$t('console.owner')"
                  ></v-list-item>
                  <v-list-item
                    v-if="negotiation.contractAgreement"
                    :title="negotiation.contractAgreement.asset.name"
                    :subtitle="$t('console.asset-name')"
                  ></v-list-item>

                  <v-list-item
                    :title="new Date(negotiation.creationDate).toLocaleString()"
                    :subtitle="$t('console.proposal-creation-date')"
                  ></v-list-item>
                  <v-list-item
                    :title="negotiation.status"
                    :subtitle="$t('console.status')"
                  ></v-list-item>
                </v-list>
              </v-col>
              <v-col cols="6">
                <v-card class="mt-5 mb-5">
                  <template v-slot:title>
                    <!--{{ negotiation.contract.name }}-->
                    {{ $t('commons.contract.contract-s') }}
                  </template>
                  <v-card-text>
                    <div class="contract-info mt-2">
                      <v-divider />
                      <v-list-item
                        :subtitle="$t('commons.policy.contract-policy')"
                        class="mt-2 mb-2"
                      >
                        <template v-slot:prepend>
                          <v-icon
                            icon="$license"
                            v-if="negotiation.contractAgreement"
                          ></v-icon>
                          <v-icon v-else class="warning" icon="$alertCircle"></v-icon>
                        </template>
                        <template v-slot:title>
                          <!--{{ negotiation.contract.contractPolicy?.name }}-->
                          {{ $t('commons.policy.policy-s') }}
                        </template>
                        <template v-slot:append v-if="negotiation.contractAgreement">
                          <v-btn
                            variant="flat"
                            density="comfortable"
                            @click="
                              showPolicyDetails(
                                $t('commons.policy.contract-policy'),
                                negotiation.contractAgreement.policy,
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
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <template v-if="!loading">
          <v-card-actions class="pa-6 pl-5 pr-5 pb-8" v-if="isReceived">
            <v-spacer></v-spacer>
            <template v-if="negotiation.status === NegotiationType.PENDING">
              <v-btn
                color="error"
                size="x-large"
                @click="refuseProposal()"
                variant="flat"
                class="mr-3"
                min-width="250px"
              >
                <v-icon size="20" icon="$closeCircle" class="mr-2" />
                {{ $t('commons.buttons.refuse') }}
              </v-btn>

              <v-btn
                color="success"
                size="x-large"
                @click="acceptProposal()"
                variant="flat"
                class="ml-3"
                min-width="250px"
              >
                <v-icon size="20" icon="$checkCircle" class="mr-2" />
                {{ $t('commons.buttons.accept') }}
              </v-btn>
            </template>
            <v-btn
              v-else-if="negotiation.status === NegotiationType.COMPLETED"
              color="success"
              size="x-large"
              variant="tonal"
              class="ml-3"
              min-width="250px"
              disabled
            >
              <v-icon size="20" icon="$checkCircle" class="mr-2" />
              {{ $t('commons.buttons.accepted') }}
            </v-btn>
            <v-btn
              v-else-if="negotiation.status === NegotiationType.REFUSED"
              color="error"
              size="x-large"
              variant="tonal"
              class="ml-3"
              min-width="250px"
              disabled
            >
              <v-icon size="20" icon="$closeCircle" class="mr-2" />
              {{ $t('commons.buttons.refused') }}
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
          <v-card-actions class="pa-4 pl-5 pr-5" v-else>
            <v-spacer></v-spacer>

            <v-btn
              v-if="negotiation.status === NegotiationType.PENDING"
              class="mr-2"
              min-width="350px"
              color="warning"
              size="x-large"
              disabled
              variant="tonal"
            >
              {{ $t('commons.buttons.pending') }}
            </v-btn>
            <v-btn
              v-else-if="negotiation.status === NegotiationType.COMPLETED"
              class="primary mr-2"
              min-width="350px"
              size="x-large"
            >
              {{ $t('commons.buttons.download') }}
            </v-btn>
            <v-btn
              v-else-if="negotiation.status === NegotiationType.REFUSED"
              class="mr-2 ml-2"
              color="error"
              min-width="350px"
              size="x-large"
              disabled
              variant="tonal"
            >
              <v-icon size="20" icon="$closeCircle" class="mr-2 ml-2" />
              {{ $t('commons.buttons.refused') }}
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </template>
      </v-card>
    </template>
  </v-dialog>
  <policy-details-field-modal ref="policydetailsfieldmodalRef" />
  <confirm-modal ref="confirmmodalref" />
</template>

<script lang="ts">
import { type Negotiation } from '@/models/negotiation';
import negotiationService from '@/services/negotiation-service';
import { type Ref, defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PolicyDetailsFieldModal from '@/components/common/PolicyDetailsFieldModal.vue';
import userService from '@/services/user-service';
import { NegotiationType } from '@/models/negotiation-type';
import ConfirmModal, { type ConfirmModalExpose } from '@/components/common/Confirm.vue';
import notifications from '@/utils/notifications';

type ViewDialogs = {
  show: boolean;
};

export default defineComponent({
  name: 'NegotiationModal',
  components: { PolicyDetailsFieldModal, ConfirmModal },
  emits: ['accepted', 'refused'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const dialogs: Ref<ViewDialogs> = ref({
      show: false,
    });
    const loading = ref(true);
    const negotiation: Ref<Negotiation | undefined> = ref();
    const isReceived = ref(false);

    const show = async (id: string) => {
      loading.value = true;
      dialogs.value.show = true;
      negotiation.value = await negotiationService.read(id);
      isReceived.value =
        negotiation.value.type === "PROVIDER";
      loading.value = false;
    };

    const hide = () => {
      dialogs.value.show = false;
    };

    const policydetailsfieldmodalRef = ref();
    const showPolicyDetails = (title: string, text: string) => {
      policydetailsfieldmodalRef.value.show(title, text);
    };

    const { notification } = notifications();
    const confirmmodalref: Ref<ConfirmModalExpose | null> = ref(null);

    const acceptProposal = async () => {
      const confirm = await confirmmodalref.value?.open({
        title: t('console.negotiations-page.operations.accept-proposal.title'),
        message: t('console.negotiations-page.operations.accept-proposal.message'),
        hardconfirm: undefined,
      });
      if (confirm) {
        await negotiationService.acceptProposal(negotiation.value?.id);
        notification.success({
          type: 'success',
          title: '',
          message: t('console.negotiations-page.proposal-accepted'),
        });
        hide();
        emit('accepted');
      }
    };
    const refuseProposal = async () => {
      const confirm = await confirmmodalref.value?.open({
        title: t('console.negotiations-page.operations.refuse-proposal.title'),
        message: t('console.negotiations-page.operations.refuse-proposal.message'),
        hardconfirm: undefined,
      });
      if (confirm) {
        await negotiationService.refuseProposal(negotiation.value?.id);
        notification.success({
          type: 'warning',
          title: '',
          message: t('console.negotiations-page.proposal-refused'),
        });
        hide();
        emit('refused');
      }
    };

    return {
      dialogs,
      show,
      hide,
      loading,
      negotiation,
      showPolicyDetails,
      policydetailsfieldmodalRef,
      isReceived,
      NegotiationType,
      acceptProposal,
      refuseProposal,
      confirmmodalref,
    };
  },
});
</script>

<style scoped lang="scss">
//
</style>
