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
      <v-card :title="$t('console.contracts-page.policy-editor')">
        <v-card-text>
          <div class="mt-5">
            <v-container fluid style="padding: 0;">
              <v-row>
                <v-col cols="4" style="padding-top: 0;">
                  <v-checkbox v-model="policy.type"
                    :label="$t('commons.policy.contract-policy')"
                    :value="PolicyType.CONTRACT"
                    :rules="[rules.checkbox_required]"
                  />
                </v-col>
                <v-col cols="4" md="4" style="padding-top: 0;">
                  <v-checkbox v-model="policy.type"
                    :label="$t('commons.policy.access-policy')"
                    :value="PolicyType.ACCESS"
                    hide-details
                    :rules="[rules.checkbox_required]"
                  />
                </v-col>
              </v-row>
            </v-container>
            
            <!--
            <v-radio-group v-model="policy.type" inline>
              <v-radio
                density="compact"
                :label="$t('commons.policy.contract-policy')"
                :value="PolicyType.CONTRACT"
                class="mr-5"
              ></v-radio>
              <v-radio
                :label="$t('commons.policy.access-policy')"
                :value="PolicyType.ACCESS"
              ></v-radio>
            </v-radio-group>
            -->
            <v-text-field
              :label="$t('console.name')"
              :rules="[rules.required, rules.min]"
              variant="outlined"
              density="compact"
              autocomplete="off"
              v-model.trim="policy.name"
            ></v-text-field>

            <v-expansion-panels variant="accordion">

              <v-expansion-panel :title="$t('console.policy-permissions')">
                <v-expansion-panel-text>
                  <v-textarea
                    :label="$t('console.policy-permissions') + ' (JSON)'"
                    :rules="[rules.required, rules.min, rules.json_valid]"
                    variant="outlined"
                    density="compact"
                    autocomplete="off"
                    v-model="policy.permissions"
                    rows="6"
                    no-resize
                    class="policy-editor"
                  ></v-textarea>
                </v-expansion-panel-text>
              </v-expansion-panel>
              
              <v-expansion-panel :title="$t('console.policy-prohibitions')">
                <v-expansion-panel-text>
                  <v-textarea
                    :label="$t('console.policy-prohibitions') + ' (JSON)'"
                    :rules="[rules.required, rules.min, rules.json_valid]"
                    variant="outlined"
                    density="compact"
                    autocomplete="off"
                    v-model="policy.prohibitions"
                    rows="6"
                    no-resize
                    class="policy-editor"
                  ></v-textarea>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel :title="$t('console.policy-obligations')">
                <v-expansion-panel-text>
                  <v-textarea
                    :label="$t('console.policy-obligations') + ' (JSON)'"
                    :rules="[rules.required, rules.min, rules.json_valid]"
                    variant="outlined"
                    density="compact"
                    autocomplete="off"
                    v-model="policy.obligations"
                    rows="6"
                    no-resize
                    class="policy-editor"
                  ></v-textarea>
                </v-expansion-panel-text>
              </v-expansion-panel>

            </v-expansion-panels>
            
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
import { type Policy } from '@/models/policy';
import { PolicyType } from '@/models/policy-type';
import { type ValidationRule } from '@/models/validationRule';
import policyService from '@/services/policy-service';
import notifications from '@/utils/notifications';
import { type Ref, defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';

type ViewDialogs = {
  show: boolean;
};

export default defineComponent({
  name: 'PolicyEditorModal',
  components: {},
  emits: ['saved'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const dialogs: Ref<ViewDialogs> = ref({
      show: false,
    });
    const loading = ref(true);
    const policy: Ref<Policy> = ref({
      name: '',
      permissions: '',
      prohibitions: '',
      obligations: '',
      type: [PolicyType.CONTRACT, PolicyType.ACCESS],
    } as Policy);

    const form = ref();
    const { notification } = notifications();

    const show = async (policyToEdit: Policy) => {
      loading.value = true;
      policy.value = {
        name: '',
        permissions: '',
        prohibitions: '',
        obligations: '',
        type: [PolicyType.CONTRACT, PolicyType.ACCESS],
        creationDate: 0,
      };
      if (policyToEdit) {
        policy.value = await policyService.read(policyToEdit.id as string);
        policy.value.permissions = policy.value.permissions;
        policy.value.prohibitions = policy.value.prohibitions;
        policy.value.obligations = policy.value.obligations;
      } else {
        policy.value = {
          name: '',
          permissions: '',
          prohibitions: '',
          obligations: '',
          type: [PolicyType.CONTRACT, PolicyType.ACCESS],
          creationDate: 0,
        };
      }
      dialogs.value.show = true;
      loading.value = false;
    };

    const hide = () => {
      dialogs.value.show = false;
    };

    const isValidJson = (text: string) => {
      try {
        JSON.parse(text);
        return true;
      }
      catch (e) {
        return false;
      }
    };

    function validateCheckboxRequired(value: string[]) {
      return value.length > 0 || t('commons.errors.required')
    }

    const isFormValid: Ref<boolean> = ref(true);
    const rules: Ref<{ [key: string]: ValidationRule }> = ref({
      required: (value: string) => !!value || t('commons.errors.required'),
      min: (value: string) =>
        (value && value.length >= 1) || t('commons.errors.field-too-short', { length: 1 }),
      json_valid: (value: string) => isValidJson(value) || t('commons.errors.json-invalid'),
      checkbox_required: (value: string[]) => value.length > 0 || t('commons.errors.required')
    });
    async function submit() {
      await form.value?.validate();

      try {
        JSON.parse(policy.value.permissions);
      }
      catch (e) {
        isFormValid.value = false;
      }

      if (isFormValid.value) {
        let succes = true;
        if (policy.value.id) {
          succes = await policyService.update(policy.value.id, policy.value);
        } else {
          const newPolicy:any = await policyService.create(policy.value);
          if (!newPolicy["@id"])
            succes = false;
        }

        loading.value = false;
        hide();

        if (succes)
          notification.success({
            type: 'success',
            title: '',
            message: policy.value.id
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
      policy,
      submit,
      rules,
      isFormValid,
      loading,
      PolicyType,
      validateCheckboxRequired
    };
  },
});
</script>

<style scoped lang="scss">
.policy-editor :deep(.v-field__field) {
  width: 100%;
  min-height: 150px;
  // background-color: rgb(25, 25, 25, 0.8);
  // color: white;
  border-radius: $border-radius;
  padding: 5px 5px;
}
</style>
