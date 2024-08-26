<template>
  <view-placeholder v-if="loading || !details" loading />
  <div ref="contentRef" v-else>
    <div v-if="isSticky" :style="isSticky ? 'height: ' + (headerHeight + 80) + 'px' : ''"></div>
    <div
      ref="headerRef"
      :class="{ 'sticky-header': isSticky }"
      :style="isSticky ? 'width: ' + headerBarWidth + 'px' : '100%'"
    >
      <v-btn prepend-icon="$arrowLeft" variant="flat" class="primary mb-2" @click="goBack()">
        {{ $t('commons.back') }}
      </v-btn>

      <h1>{{ details?.name }}</h1>
      <p class="description mb-2">
        {{ details?.description }}
      </p>

      <div id="tabs-header-slot"></div>
    </div>
    <div class="mt-3">
      <asset-details :asset="details" :isSticky="isSticky" />
    </div>
  </div>
</template>

<script lang="ts">
import { type Ref, computed, onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import { onBeforeUnmount } from 'vue';
import assetsService from '@/services/asset-service';
import { EntityType } from '@/models/resource-type';
import ViewPlaceholder from '@/components/common/ViewPlaceholder.vue';
import AssetDetails from '@/components/catalog/AssetDetails.vue';
import router from '@/router';
import { type Asset } from '@/models/asset';
export default defineComponent({
  name: 'DetailsView',
  components: {
    ViewPlaceholder,
    AssetDetails,
  },
  setup() {
    const route = useRoute();

    const loading = ref(true);

    const isSticky = ref(false);

    const headerBarWidth = ref(undefined);
    const headerHeight = ref(0);

    const contentRef = ref();
    const headerRef = ref();

    const details: Ref<Asset | undefined> = ref();

    onMounted(() => {
      window.scrollTo(0, 0);
      window.addEventListener('scroll', handleScroll);
      loadDetails();
    });

    const loadDetails = async () => {
      //details.value = await assetsService.read(route.params.id as string);
      details.value = await assetsService.readFromCatalog(route.params.id as string);
      loading.value = false;
    };

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    const handleScroll = () => {
      isSticky.value = (window.scrollY || window.pageYOffset) > 0;
    };

    const entityType = computed(() => {
      if (route.name?.toString().includes('corpus')) {
        return EntityType.CORPUS;
      } else if (route.name?.toString().includes('service')) {
        return EntityType.SERVICE;
      } else if (route.name?.toString().includes('model')) {
        return EntityType.MODEL;
      } else if (route.name?.toString().includes('lexical-resource')) {
        return EntityType.LEXICAL_RESOURCE;
      }
      return null;
    });

    const goBack = () => {
      if (window.history.length > 2) {
        router.back();
      } else {
        router.push({
          name: route.fullPath.split('/')[2],
        });
      }
    };

    return {
      loading,
      isSticky,
      contentRef,
      headerBarWidth,
      headerRef,
      headerHeight,
      entityType,
      EntityType,
      details,
      goBack,
    };
  },
});
</script>

<style scoped lang="scss">
.sticky-header {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
  background-color: #fff;
  border-bottom: 1px solid $gray-light;
  margin-left: -45px;
  padding: 15px 45px;
  padding-bottom: 0;

  h1 {
    display: inline-block;
    margin-left: 15px;
  }

  .description {
    display: none;
  }
}
.description {
  font-size: 14px;
  color: $text-color-medium;
}
</style>
@/models/asset
