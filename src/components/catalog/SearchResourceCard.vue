<template>
  <v-card
    :to="{
      name: $route.name?.toString().toLocaleLowerCase() + '-details',
      params: { id: $props.resource.id?.toString() },
    }"
  >
    <v-card-title>
      <span>{{ $props.resource.name }}</span>
    </v-card-title>
    <v-card-subtitle>
      <span :title="$props.resource.description">{{ $props.resource.description }}</span>
    </v-card-subtitle>
    <v-card-text class="pb-0">
      <div class="card-info">
        <div>
          <v-icon icon="$flag" />
          {{
            $props.resource.languages
              .map((l) => $t('catalog.filters.languages.options.' + (l as Language).name))
              .join(', ')
          }}
        </div>
        <div v-if="$props.resource.user">
          <v-icon icon="$accountOutline" />
          {{ ($props.resource.user as User).username }}
        </div>
        <div>
          <v-icon icon="$shapeOutline" />
          {{ $props.resource.categories.map((l) => (l as Category).name).join(', ') }}
        </div>
        <div>
          <v-icon icon="$link" />
          {{ $props.resource.originator }}
        </div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-list-item class="w-100">
        <template v-slot:prepend>
          <span class="updated-time">
            {{
              $t('catalog.created', {
                date: new Date($props.resource.creationDate).toLocaleDateString(),
              })
            }}
          </span>
        </template>

        <template v-slot:append></template>
      </v-list-item>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { type Asset } from '@/models/asset';
import { type Category } from '@/models/category';
import { type Language } from '@/models/language';
import { type User } from '@/models/user';
import { type PropType } from 'vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SearchGridViewCard',
  components: {},
  props: {
    resource: {
      type: Object as PropType<Asset>,
      required: true,
    },
  },
  emits: [],
  setup() {
    return {};
  },
});
</script>

<style scoped lang="scss">
.updated-time {
  font-size: 13px;
  color: $text-color-light;
}

.card-info {
  & .v-icon {
    color: $primary-color;
    // color: $text-color-light;
    opacity: 0.6;
  }
}

.card-info div {
  margin: 2px 0;
}
</style>
@/models/asset
