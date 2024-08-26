<template>
  <div class="console-content">
    <template v-if="!$route.meta.hideDefaultHeader">
      <h1>{{ $t('commons.console.' + $route.name?.toString()) }}</h1>
      <p class="description mb-2">
        {{ $t('commons.console.' + $route.name?.toString() + '-description') }}
      </p>
    </template>
    <router-view :key="$route.fullPath" v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ConsoleView',
  components: {},
  setup() {
    return {};
  },
});
</script>

<style scoped lang="scss">
.description {
  font-size: 14px;
  color: $text-color-medium;
}
</style>
