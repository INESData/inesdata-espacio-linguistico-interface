<template>
  <v-app-bar class="header-bar" scroll-behavior="elevate" height="80">
    <v-app-bar-title>
      <img class="logo" src="/icons/logo_1.svg" alt="Inesdata" height="40" />
      InesData
    </v-app-bar-title>
    <template v-slot:append>
      <router-link :to="{ name: 'catalog' }">
        <v-btn class="secondary">{{ $t('commons.buttons.go-to-catalog') }}</v-btn>
      </router-link>
    </template>
  </v-app-bar>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'HeaderBar',
  components: {},
  setup() {
    const route = useRoute();

    return {
      route,
    };
  },
});
</script>

<style scoped lang="scss">
.header-bar {
  // border-bottom: 1px solid transparent;
  // box-shadow: $shadow !important;
  padding: 0 10vw;
  background-color: $secondary-color;

  & * {
    color: white;
  }

  @media only screen and (max-width: 768px) {
    padding: 0 0;
  }

  @media only screen and (max-width: 480px) {
    a {
      display: none;
    }
  }

  & .logo {
    height: 35px;
    object-fit: contain;
    vertical-align: middle;
  }
}

.title-box {
  padding-right: 15px;
  & > * {
    display: inline-block;
    vertical-align: top;
  }
}
</style>
