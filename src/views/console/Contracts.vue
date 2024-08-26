<template>
  <div>
    <div class="tabs mt-8">
      <v-btn :variant="selectedTab === 1 ? 'tonal' : 'text'" @click="selectedTab = 1">
        {{ $t('commons.console.contracts') }}
      </v-btn>
      <v-btn :variant="selectedTab === 2 ? 'tonal' : 'text'" @click="selectedTab = 2">
        {{ $t('commons.console.policies') }}
      </v-btn>
    </div>
    <div>
      <contracts-editor v-if="selectedTab === 1" />
      <policies-editor v-else-if="selectedTab === 2" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ContractsEditor from '@/components/console/ContractsEditor.vue';
import PoliciesEditor from '@/components/console/PoliciesEditor.vue';

export default defineComponent({
  name: 'ContractsView',
  components: { ContractsEditor, PoliciesEditor },
  setup() {
    const selectedTab = ref(1);

    return { selectedTab };
  },
});
</script>

<style scoped lang="scss">
//
</style>
