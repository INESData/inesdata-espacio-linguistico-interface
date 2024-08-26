<template>
  <v-dialog v-model="dialogs.show" width="750">
    <v-card :title="dialogTitle">
      <v-card-text>
        <div class="policy-viewer">
            <pre>{{ dialogText }}</pre>
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
import { type Ref, defineComponent, ref } from 'vue';

type ViewDialogs = {
  show: boolean;
};

export default defineComponent({
  name: 'PolicyDetailsFieldModal',
  components: {},
  emits: ['create:success', 'create:error', 'update:success', 'update:error'],
  setup(props, { emit }) {
    const dialogs: Ref<ViewDialogs> = ref({
      show: false,
    });
    const loading = ref(true);

    const dialogTitle = ref('');
    const dialogText = ref();

    const show = async (title: string, text: string) => {
      loading.value = true;
      dialogTitle.value = title;
      dialogs.value.show = true;
      dialogText.value = text;
      loading.value = false;
    };

    const hide = () => {
      dialogs.value.show = false;
    };

    return {
      dialogs,
      show,
      hide,
      dialogTitle,
      dialogText,
    };
  },
});
</script>

<style scoped lang="scss">
.policy-viewer {
  width: 100%;
  min-height: 200px;
  background-color: rgb(25, 25, 25, 0.8);
  color: white;
  border-radius: $border-radius;
  padding: 5px 5px;
}
</style>
