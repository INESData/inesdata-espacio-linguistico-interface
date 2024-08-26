<template>
  <v-dialog v-model="dialogs.show" width="750">
    <v-card :title="dialogTitle" :subtitle="dialogSubtitle">
      <v-card-text>
        <div class="policy-viewer">
            <h3>{{$t('console.policy-permissions')}}</h3>
            <pre>{{ policy?.permissions }}</pre>
            <h3>{{$t('console.policy-prohibitions')}}</h3>
            <pre>{{ policy?.prohibitions }}</pre>
            <h3>{{$t('console.policy-obligations')}}</h3>
            <pre>{{ policy?.obligations }}</pre>
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
import { type Policy } from '@/models/policy';
import policyService from '@/services/policy-service';
import { type Ref, defineComponent, ref } from 'vue';

type ViewDialogs = {
  show: boolean;
};

export default defineComponent({
  name: 'PolicyDetailsModal',
  components: {},
  emits: ['create:success', 'create:error', 'update:success', 'update:error'],
  setup(props, { emit }) {
    const dialogs: Ref<ViewDialogs> = ref({
      show: false,
    });
    const loading = ref(true);

    const dialogTitle = ref('');
    const dialogSubtitle = ref('');
    const policy: Ref<Policy | undefined> = ref();

    const show = async (id: string, title: string, subtitle?: string) => {
      loading.value = true;
      dialogTitle.value = title;
      dialogSubtitle.value = subtitle || '';
      dialogs.value.show = true;
      policy.value = await policyService.read(id);
      loading.value = false;
    };

    const hide = () => {
      dialogs.value.show = false;
    };

    return {
      dialogs,
      show,
      hide,
      policy,
      dialogTitle,
      dialogSubtitle,
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
