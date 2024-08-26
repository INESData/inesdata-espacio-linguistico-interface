<template>
  <div>
    <v-row class="ma-2 pa-0 mt-5">
      <v-col cols="10" class="pa-0">
        <v-row class="pa-0 ma-0">
          <template v-for="(filter, k) in $props.filters">
            <v-col
              class="pt-0 pb-0 pl-1 pr-1"
              :cols="filter.cols || 4"
              :key="k"
              v-if="
                (filter.type === FilterType.SELECT && filter.options?.length) ||
                filter.type !== FilterType.SELECT
              "
            >
              <v-text-field
                v-if="filter.type === FilterType.SEARCH"
                :label="filter.label"
                v-model="filter.value"
                variant="outlined"
                density="compact"
                hide-details
                :data-testid="'input-' + filter.code"
                append-inner-icon="$magnify"
                autocomplete="off"
                rounded
              ></v-text-field>
              <v-select
                v-else-if="filter.type === FilterType.SELECT"
                :label="filter.label"
                :items="filter.options"
                v-model="filter.value"
                variant="outlined"
                density="compact"
                hide-details
                item-title="label"
                rounded
                item-value="value"
                :menu-props="{
                  closeOnContentClick: true,
                }"
              >
                <template v-slot:prepend-item>
                  <v-list-item
                    :title="$t('console.filters.all')"
                    @click="filter.value = null"
                  ></v-list-item>
                </template>
              </v-select>
            </v-col>
          </template>
        </v-row>
      </v-col>
      <v-col cols="2" class="pa-0 text-right" align-self="end" v-if="$props.button">
        <create-button
          size="large"
          :contracts="$route.name === 'contracts'"
          @item-click="itemClick"
          :entityType="$props.entityType"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { type SearchFilters } from '@/models/search-filters';
import { type PropType } from 'vue';
import { defineComponent } from 'vue';
import { FilterType } from '@/models/filter';
import CreateButton from '../common/CreateButton.vue';
import { EntityType } from '@/models/resource-type';

export default defineComponent({
  name: 'ConsoleFilters',
  components: { CreateButton },
  props: {
    filters: {
      type: Object as PropType<SearchFilters>,
    },
    button: {
      type: Boolean,
    },
    entityType: {
      type: String as PropType<EntityType>,
    },
  },
  emits: ['buttonItemClick'],
  setup(props, { emit }) {
    const itemClick = (type: EntityType) => {
      emit('buttonItemClick', type);
    };
    return { FilterType, itemClick };
  },
});
</script>

<style scoped lang="scss">
//
</style>
