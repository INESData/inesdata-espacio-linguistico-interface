<template>
  <div class="placeholder">
    <div v-if="$props.loading">
      <v-progress-circular class="mb-3" size="55" color="grey" indeterminate></v-progress-circular>
    </div>
    <div v-else>
      <img :src="$props.image" height="60" class="mb-1" />
      <v-icon size="55" class="mb-3" v-if="$props.icon">{{ $props.icon }}</v-icon>
      <h1 class="mb-3" v-if="$props.title">{{ $props.title }}</h1>
      <p class="text" v-if="$props.text">{{ $props.text }}</p>
      <v-btn v-if="$props.button" class="primary mt-5" @click="onClick()">
        {{ $props.button }}
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ViewPlaceholder',
  emits: ['onclick'],
  props: {
    title: {
      type: String,
    },
    text: {
      type: String,
    },
    icon: {
      type: String,
    },
    image: {
      type: String,
    },
    button: {
      type: String,
    },
    testkey: {
      type: String,
    },
    loading: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const onClick = () => {
      emit('onclick');
    };
    return {
      onClick,
    };
  },
});
</script>

<style scoped lang="scss">
.placeholder {
  text-align: center;
  font-size: 14px;
  // margin-top: 20vh;
  color: rgba(25, 25, 25, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 30vh;
  height: 100%;

  & > div {
    margin-top: -5vh;
  }
  & .v-icon {
    opacity: 0.4;
  }

  & p.text {
    padding: 0 10vw;
  }
}
</style>
