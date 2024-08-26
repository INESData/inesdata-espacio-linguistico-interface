<template>
  <header-bar />
  <v-main>
    <div class="section header">
      <div>
        <h1>{{ $t('landing-page.main-title') }}</h1>
        <p class="mb-10">
          {{ $t('landing-page.main-subtitle') }}
        </p>
        <router-link :to="{ name: 'catalog' }">
          <v-btn class="secondary" size="x-large">{{ $t('commons.buttons.go-to-catalog') }}</v-btn>
        </router-link>
      </div>
    </div>
    <div class="section"></div>
    <div class="section footer"></div>
  </v-main>
</template>

<script lang="ts">
import { type Ref, onMounted, watch } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import HeaderBar from '@/components/landing-page/HeaderBar.vue';
import { computed } from 'vue';

export default defineComponent({
  name: 'HomeView',
  components: { HeaderBar },
  setup() {
    const { t } = useI18n();
    const route = useRoute();

    return {};
  },
});
</script>

<style scoped lang="scss">
.section {
  height: calc(100vh - 64px);
  width: 100%;
  position: relative;
  padding: 20px 20px;

  &.header {
    background-color: $secondary-color;
    & > div {
      width: 100%;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      text-align: center;

      & h1 {
        font-weight: 500;
        font-size: 2.5rem;
        color: white;
      }

      & p {
        color: white;
      }
    }
  }
}

/* .section-1 {
  height: calc(100vh - 64px);
  width: 100%;
  position: relative;
  & > img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  & > .content {
    width: 100%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;

    & * {
      color: white;
    }

    & h1 {
      font-weight: 500;
      font-size: 2.5rem;
    }
  }
}

.section-2 {
  padding: 20px 20px;
}
.section-footer {
  color: white;
  background-color: #222 !important;
  text-align: center;
  padding: 3rem 0;
  & * {
    color: white;
  }

  & p {
    margin-bottom: 5px;
    white-space: pre-line;
  }

  & p.title {
    font-size: 1.75rem;
    margin-bottom: 5px;
  }
} */
</style>
