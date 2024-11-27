<template>
  <div>INESData test view</div>
</template>

<script lang="ts">
import { type Ref, onMounted, watch } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'TemplateView',
  components: {},
  setup() {
    const { t } = useI18n();
    const route = useRoute();

    onMounted(() => {
      console.log('test');
    });

    return {};
  },
});
</script>

<style scoped lang="scss"></style>
