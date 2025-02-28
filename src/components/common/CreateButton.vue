<template>
  <v-btn
    class="primary"
    :size="$props.size"
    v-if="$props.entityType && !$props.contracts"
    :to="{ name: 'asset-create', params: { type: $props.entityType } }"
  >
    {{ $t('commons.buttons.create') }}
  </v-btn>
  <v-btn
    class="primary"
    :size="$props.size"
    v-else-if="$props.entityType && $props.contracts"
    @click="$emit('itemClick', $props.entityType)"
  >
    {{ $t('commons.buttons.create') }}
  </v-btn>
  <v-menu v-else>
    <template v-slot:activator="{ props }">
      <v-btn class="primary" :size="$props.size" v-bind="props">
        {{ $t('commons.buttons.create') }}
      </v-btn>
    </template>
    <v-list class="pa-2">
      <v-list-item
        :to="{ name: 'asset-create', params: { type: EntityType.CORPUS } }"
        prepend-icon="$folderTextOutline"
        :title="$t('commons.corpus.corpus-s')"
        :active="false"
      ></v-list-item>
      <v-list-item
        :to="{ name: 'asset-create', params: { type: EntityType.SERVICE } }"
        prepend-icon="$cogPlayOutline"
        :title="$t('commons.service.service-s')"
        :active="false"
      ></v-list-item>
      <v-list-item
        :to="{ name: 'asset-create', params: { type: EntityType.MODEL } }"
        prepend-icon="$axisArrow"
        :title="$t('commons.model.model-s')"
        :active="false"
      ></v-list-item>
      <v-list-item
        :to="{ name: 'asset-create', params: { type: EntityType.LEXICAL_RESOURCE } }"
        prepend-icon="$textBoxOutline"
        :title="$t('commons.lexical-resource.lexical-resource-s')"
        :active="false"
      ></v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { EntityType } from '@/models/resource-type';
import { type PropType, defineComponent } from 'vue';

export default defineComponent({
  name: 'CreateButton',
  props: {
    size: {
      type: String,
    },
    entityType: {
      type: String as PropType<EntityType>,
    },
    contracts: {
      type: Boolean,
    },
  },
  emits: ['itemClick'],
  setup() {
    return {
      EntityType,
    };
  },
});
</script>

<style scoped lang="scss">
//
</style>
