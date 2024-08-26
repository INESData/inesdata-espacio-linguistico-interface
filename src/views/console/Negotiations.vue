<template>
  <div>
    <div class="tabs mt-8">
      <v-btn :variant="selectedTab === 1 ? 'tonal' : 'text'" @click="selectedTab = 1">
        {{ $t('console.negotiations-page.proposal-sent') }}
      </v-btn>
      <v-btn :variant="selectedTab === 2 ? 'tonal' : 'text'" @click="selectedTab = 2">
        {{ $t('console.negotiations-page.proposal-received') }}
      </v-btn>
    </div>
    <div>
      <negotiations-sent v-if="selectedTab === 1" />
      <negotiations-received v-else-if="selectedTab === 2" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import NegotiationsReceived from '@/components/console/NegotiationsReceived.vue';
import NegotiationsSent from '@/components/console/NegotiationsSent.vue';

export default defineComponent({
  name: 'NegotiationsView',
  components: { NegotiationsReceived, NegotiationsSent },
  setup() {
    const selectedTab = ref(1);
    return { selectedTab };
  },
});
</script>

<style scoped lang="scss">
//
</style>
