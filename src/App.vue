<template>
  <v-app>
    <notifications />
    <div id="app">
      <router-view :key="$route.fullPath" v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <div :key="($route.name as string)">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </div>
  </v-app>
</template>

<script lang="ts">
import { RouterView } from 'vue-router';
import { defineComponent } from 'vue';
import Notifications from './components/common/Notifications.vue';

export default defineComponent({
  name: 'App',
  components: { RouterView, Notifications },
  setup() {
    return {};
  },
});
</script>
<style scoped>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
