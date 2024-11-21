<template>
  <div>
    <div class="tabs mt-8">
      <v-btn :variant="selectedTab === 1 ? 'tonal' : 'text'" @click="selectedTab = 1">
        {{ $t('console.transfers-page.consumer') }}
      </v-btn>
      <v-btn :variant="selectedTab === 2 ? 'tonal' : 'text'" @click="selectedTab = 2">
        {{ $t('console.transfers-page.provided') }}
      </v-btn>
    </div>
    <div>
      <transfers-consumer v-if="selectedTab === 1" />
      <transfers-provided v-else-if="selectedTab === 2" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import TransfersConsumer from '@/components/console/TransfersConsumer.vue';
import TransfersProvided from '@/components/console/TransfersProvided.vue';

export default defineComponent({
  name: 'TransfersView',
  components: { TransfersConsumer, TransfersProvided },
  setup() {
    const selectedTab = ref(1);
    return { selectedTab };
  },
});
</script>

<style scoped lang="scss">
//
</style>
