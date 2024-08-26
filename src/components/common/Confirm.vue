<template>
  <v-dialog
    v-model="isOpen"
    :width="options.width"
    :style="{ zIndex: options.zIndex as any}"
    @keydown.esc="cancel"
    data-testid="confirm-modal"
  >
    <v-card>
      <!-- component header -->
      <v-card-title class="text-h6 font-weight-regular justify-space-between ml-2 mt-1">
        <strong>{{ title }}</strong>
      </v-card-title>
      <!-- component subheader -->
      <v-card-subtitle>
        <span>{{ subtitle }}</span>
      </v-card-subtitle>
      <v-card-text class="mt-0 mb-3">
        <span v-html="message"></span>
        <v-text-field
          v-if="hardconfirm"
          v-model.trim="confirmation"
          :hint="$t('confirm.hint')"
          persistent-hint
          autocomplete="off"
        ></v-text-field>
      </v-card-text>

      <v-spacer></v-spacer>
      <!-- confirm commands (buttons) -->
      <v-card-actions class="pl-4 pr-4">
        <v-btn class="cancel" @click.stop="cancel()">
          {{ $t(`commons.buttons.cancel`) }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          class="primary"
          data-testid="confirm-action"
          :disabled="typeof hardconfirm !== 'undefined' && hardconfirm !== confirmation"
          @click.stop="agree()"
        >
          {{ $t(`commons.buttons.confirm`) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, type Ref, ref, toRefs } from 'vue';

type State = {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  message?: string;
  hardconfirm?: string;
  resolve?: (value: unknown) => void;
  reject?: (value: unknown) => void;
  options: { [key: string]: string | number };
};

export type ConfirmModalExpose = {
  open: (
    confirm: { title: string; subtitle?: string; message: string; hardconfirm?: string },
    options?: { [key: string]: string | number },
  ) => Promise<boolean>;
  agree: () => void;
  cancel: () => void;
} & HTMLElement;

export default defineComponent({
  name: 'ConfirmModal',
  components: {},
  setup(_, { expose }) {
    // services

    const state: State = reactive({
      isOpen: false,
      title: undefined,
      subtitle: undefined,
      message: undefined,
      resolve: undefined,
      reject: undefined,
      hardconfirm: undefined,
      options: {
        color: 'primary',
        width: 500,
        zIndex: 10000,
      },
    });
    const confirmation: Ref<string> = ref('');

    const open = (
      confirm: { title: string; subtitle?: string; message: string; hardconfirm?: string },
      options?: { [key: string]: string | number },
    ) => {
      state.isOpen = true;
      state.title = confirm.title;
      state.subtitle = confirm.subtitle;
      state.message = confirm.message;
      state.hardconfirm = confirm.hardconfirm;
      state.options = Object.assign(state.options, options);
      return new Promise((resolve, reject) => {
        state.resolve = resolve;
        state.reject = reject;
      });
    };

    const agree = () => {
      if (typeof state.resolve !== 'undefined') {
        state.resolve(true);
      }
      confirmation.value = '';
      state.isOpen = false;
    };

    const cancel = () => {
      if (typeof state.resolve !== 'undefined') {
        state.resolve(false);
      }
      confirmation.value = '';
      state.isOpen = false;
    };

    expose({ open, agree, cancel });

    return {
      ...toRefs(state),
      open,
      agree,
      cancel,
      confirmation,
    };
  },
});
</script>

<style lang="scss" scoped>
//
</style>
