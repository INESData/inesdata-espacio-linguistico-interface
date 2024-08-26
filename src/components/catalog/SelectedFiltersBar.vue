<template>
  <div v-if="filtersLength" class="pl-3 pr-3 pb-2">
    <template v-for="(item, k) in $props.filters" :key="item">
      <span v-if="!['query'].includes(k.toString()) && item.value.length" class="mr-2">
        <v-chip
          v-for="f in item.value"
          :key="f"
          class="mr-1"
          @click="item.value = item.value.filter((i: any) => i !== f)"
          :title="
            $te('catalog.filters.' + k + '.options.' + f)
              ? $t('catalog.filters.' + k + '.options.' + f)
              : f
          "
        >
          <span class="chip-text">
            {{
              $te('catalog.filters.' + k + '.options.' + f)
                ? $t('catalog.filters.' + k + '.options.' + f)
                : f
            }}
          </span>
          <v-icon end icon="$close"></v-icon>
        </v-chip>
      </span>
    </template>
    <v-chip variant="text" v-if="filtersLength > 1" @click="removeAll">
      {{ $t('catalog.clear-all') }}
    </v-chip>
  </div>
</template>

<script lang="ts">
import { type SearchFilters } from '@/models/search-filters';
import { computed } from 'vue';
import { type PropType } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FiltersBar',
  props: {
    filters: {
      type: Object as PropType<SearchFilters>,
    },
  },
  setup(props) {
    const removeAll = () => {
      for (const [f, value] of Object.entries(props.filters as SearchFilters)) {
        if (!['query'].includes(f)) {
          value.value = [];
        }
      }
    };

    const filtersLength = computed(() => {
      let length = 0;
      for (const f in props.filters) {
        if (!['query'].includes(f)) {
          length += props.filters[f].value.length;
        }
      }
      return length;
    });
    return { filtersLength, removeAll };
  },
});
</script>

<style scoped lang="scss">
.v-chip {
  background-color: $secondary-color;
  color: white;
  cursor: pointer;

  &.v-chip--variant-text {
    background-color: white;
    color: $secondary-color;
  }

  & span.chip-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 150px;
    display: block;
  }
}
</style>
