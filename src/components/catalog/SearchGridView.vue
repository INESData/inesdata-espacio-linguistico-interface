<template>
  <div class="mt-3 pb-10">
    <transition name="fade" mode="out-in">
      <template v-if="loading">
        <v-row>
          <v-col cols="12" md="4" v-for="item in 9" :key="item">
            <v-skeleton-loader
              :elevation="1"
              type="article, list-item"
              height="205px"
            ></v-skeleton-loader>
          </v-col>
        </v-row>
      </template>
      <v-row v-else-if="$props.items && $props.items.length">
        <v-col cols="12" md="4" v-for="item in $props.items" :key="item.id">
          <search-resource-card :resource="item" />
        </v-col>
        <v-col cols="12">
          <v-pagination
            v-model="pagination.page"
            :length="$props.totalPages"
            :total-visible="pagination.size"
            rounded="7"
          ></v-pagination>
        </v-col>
      </v-row>
      <view-placeholder :text="$t('catalog.no-results')" v-else />
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, type Ref, ref } from 'vue';
import { type Pagination } from '@/models/pagination';
import ViewPlaceholder from '../common/ViewPlaceholder.vue';
import SearchResourceCard from '@/components/catalog/SearchResourceCard.vue';
import { type Asset } from '@/models/asset';

export default defineComponent({
  name: 'GridView',
  components: { ViewPlaceholder, SearchResourceCard },
  props: {
    items: {
      type: Array as PropType<Asset[]>,
      default: () => [],
    },
    paginationOptions: {
      type: Object as PropType<Pagination>,
      required: true,
    },
    isLastPage: {
      type: Boolean,
    },
    loading: {
      type: Boolean,
    },
    totalPages: {
      type: Number,
    },
  },
  emits: [],
  setup(props) {
    const pagination: Ref<Pagination> = ref(props.paginationOptions);

    return {
      pagination,
    };
  },
});
</script>

<style scoped lang="scss"></style>
@/models/asset
