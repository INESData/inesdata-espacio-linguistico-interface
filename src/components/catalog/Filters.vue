<template>
  <div>
    <v-expansion-panels>
      <template v-for="(filter, k) in $props.filters" :key="k">
        <v-expansion-panel v-if="k.toString() !== 'query'" elevation="1" :value="k" @click.stop>
          <v-expansion-panel-title>
            <v-icon
              class="filter-icon mr-2"
              v-if="filter.icon"
              :icon="filter.icon"
              size="20"
            ></v-icon>
            {{ $t('catalog.filters.' + k + '.' + k) }}
            <v-icon class="selected-dot" v-if="filter.value.length" icon="$circleMedium"></v-icon>
          </v-expansion-panel-title>
          <v-expansion-panel-text @click.stop>
            <v-text-field
              v-if="filter.options.length > 8"
              v-model="searchString"
              variant="outlined"
              density="compact"
              hide-details
              append-inner-icon="$magnify"
              autocomplete="off"
              rounded
            ></v-text-field>
            <v-virtual-scroll
              :max-height="200"
              :items="filter.options.filter((o: string) => getLabel(k, o).toLocaleLowerCase().includes(searchString.toLocaleLowerCase()))"
            >
              <template v-slot:default="{ item }">
                <v-checkbox
                  @click.stop
                  density="compact"
                  v-model="filter.value"
                  :label="
                    ($te('catalog.filters.' + k + '.options.' + item)
                      ? $t('catalog.filters.' + k + '.options.' + item)
                      : item) as string
                  "
                  :value="item"
                  hide-details
                ></v-checkbox>
              </template>
            </v-virtual-scroll>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </template>
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import { type SearchFilters } from '@/models/search-filters';
import { defineComponent, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'SearchFilters',
  components: {},
  props: {
    filters: {
      type: Object as PropType<SearchFilters>,
    },
  },
  setup() {
    const searchString = ref('');
    const { t } = useI18n();
    const { te } = useI18n();

    function getLabel(k: string | number, o: string): string {

      if (te('catalog.filters.' + k + '.options.' + o))
        return t('catalog.filters.' + k + '.options.' + o);
      else
        return o;
    };

    return { searchString, getLabel };
  },
});
</script>

<style scoped lang="scss">
.selected-dot {
  color: $secondary-color;
}

.filter-icon {
  color: $text-color-light;
}

:deep(.v-label) {
  font-size: 14px;
  color: $text-color-dark;
  opacity: 1;
}
</style>
