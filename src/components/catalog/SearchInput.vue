<template>
  <v-text-field
    :placeholder="$props.placeholder"
    v-model="stringVal"
    variant="outlined"
    :density="$props.small ? 'compact' : 'comfortable'"
    hide-details
    append-inner-icon="$magnify"
    autocomplete="off"
    class="search-input"
    rounded
    clearable
    :autofocus="$props.autofocus"
    :class="{ active: stringVal?.length }"
  ></v-text-field>
</template>

<script lang="ts">
import debounce from 'lodash.debounce';
import { defineComponent, watch, ref } from 'vue';

export default defineComponent({
  name: 'SearchInput',
  components: {},
  props: {
    modelValue: {
      type: String,
    },
    placeholder: {
      type: String,
    },
    small: {
      type: Boolean,
    },
    autofocus: {
      type: Boolean,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const stringVal = ref(props.modelValue);

    watch(
      () => props.modelValue,
      (currentValue, oldValue) => {
        if (currentValue !== oldValue) {
          stringVal.value = currentValue;
        }
      },
    );

    watch(
      () => stringVal.value,
      debounce((currentValue, oldValue) => {
        if (currentValue !== oldValue) {
          emit('update:modelValue', currentValue);
        }
      }, 500),
    );
    return { stringVal };
  },
});
</script>

<style scoped lang="scss">
.search-input {
  & :deep(.v-field) {
    background-color: $secondary-color-bg-light;
  }
  & :deep(.v-field__outline > *) {
    border-color: $secondary-color-bg-light !important;
  }

  & :deep(.v-icon) {
    color: $secondary-color !important;
  }

  &.active {
    & :deep(.v-field__overlay) {
      border: 2px solid $secondary-color !important;
    }
  }
}
</style>
