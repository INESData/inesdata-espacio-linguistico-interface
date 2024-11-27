<template>
  <v-layout>
    <v-navigation-drawer permanent :rail="isMobile">
      <div class="logo">
        <router-link :to="{ name: 'catalog' }" style="text-decoration: none; color: inherit;" :title="$t('commons.buttons.go-to-catalog')">
          <img class="logo" src="/icons/logo_1.svg" alt="INESData" height="40" />
          <span class="ml-2" v-if="!isMobile">INESData</span>
        </router-link>
      </div>
      <div class="text-center mb-5 mt-3">
        <create-button v-if="!isMobile" size="large" />
      </div>
      <v-list color="transparent" :class="!isMobile ? 'pl-9' : ''">
        <v-list-item
          :to="{ name: 'corpus' }"
          prepend-icon="$folderTextOutline"
          :title="$t('commons.corpus.corpus')"
          :active="$route.meta.parent === 'corpus'"
        ></v-list-item>
        <!--
        <v-list-item
          :to="{ name: 'services' }"
          prepend-icon="$cogPlayOutline"
          :title="$t('commons.service.service')"
          :active="$route.meta.parent === 'services'"
        ></v-list-item>
        -->
        <v-list-item
          :to="{ name: 'models' }"
          prepend-icon="$axisArrow"
          :title="$t('commons.model.model')"
          :active="$route.meta.parent === 'models'"
        ></v-list-item>
        <v-list-item
          :to="{ name: 'lexical-resources' }"
          prepend-icon="$textBoxOutline"
          :title="$t('commons.lexical-resource.lexical-resource')"
          :active="$route.meta.parent === 'lexical-resources'"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <v-list color="transparent">
          <v-divider></v-divider>
        </v-list>
        <v-list color="transparent" class="pb-4" :class="!isMobile ? 'pl-9' : ''">
          <v-list-item
            :to="{ name: 'account' }"
            prepend-icon="$accountCircleOutline"
            :title="$t('commons.account.account')"
          ></v-list-item>
          <v-list-item
            :to="{ name: 'console' }"
            prepend-icon="$briefcaseAccountOutline"
            :title="$t('commons.console.console')"
          ></v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>
    <v-navigation-drawer permanent v-if="routeChildren.length" width="180" class="sub-menu">
      <h3>{{ $t('commons.console.' + ($route.meta.parent || $route.name)) }}</h3>
      <v-list>
        <v-list-item
          v-for="child in routeChildren"
          :title="$t('commons.console.' + child.name?.toString())"
          :to="{ name: child.name }"
          :key="child.name"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main style="min-height: 100vh">
      <view-placeholder
        :title="$t('commons.app-title')"
        image="./icons/logo_1.svg"
        :text="$t('catalog.catalog-description')"
        v-if="$route.name === 'catalog'"
      />
      <template v-else>
        <router-view :key="$route.path" v-slot="{ Component }" class="pl-10 pr-10 pt-8">
          <keep-alive :key="$route.path"><component :is="Component" /></keep-alive>
        </router-view>
      </template>
    </v-main>
  </v-layout>
</template>

<script lang="ts">
import { type Ref, defineComponent, ref } from 'vue';
import ViewPlaceholder from '@/components/common/ViewPlaceholder.vue';
import checkMobile from '@/utils/utils';
import { type RouteRecordRaw, useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';
import CreateButton from '@/components/common/CreateButton.vue';

export default defineComponent({
  name: 'CatalogView',
  components: { ViewPlaceholder, CreateButton },
  setup() {
    const isMobile = ref(checkMobile());
    const route = useRoute();
    const router = useRouter();
    const routeChildren: Ref<RouteRecordRaw[]> = ref([]);

    onMounted(() => {
      let children: RouteRecordRaw[] = [];
      const parentName = route.meta.parent || route.name;
      const cRoute = router.getRoutes().find((r) => r.name === parentName);
      if (cRoute && cRoute.children) {
        children = cRoute.children.filter((c) => c.meta?.submenu);
      }
      routeChildren.value = children;
    });

    return { isMobile, routeChildren };
  },
});
</script>

<style scoped lang="scss">
.logo {
  text-align: center;
  vertical-align: middle;
  line-height: 100px;
  font-size: 18px;
  margin-top: 8px;
  & img {
    height: 40px;
  }
}

:deep(nav.v-navigation-drawer) {
  height: 100vh !important;
  position: fixed !important;
  top: 0 !important;

  & .v-list-item__spacer {
    width: 20px;
  }
}

.sub-menu {
  padding: 15px 0;
  padding-left: 30px;
  padding-top: 45px;
  background-color: $secondary-color-bg-ultra-light;

  & h3 {
    margin-bottom: 45px;
  }
}

main > div {
  position: relative;
}
</style>
