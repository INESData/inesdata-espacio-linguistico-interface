<template>
  <div>Account</div>
</template>

<script lang="ts">
import { type Ref, onMounted, watch } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'AccountView',
  components: {},
  setup() {
    const { t } = useI18n();
    const route = useRoute();

    return {};
  },
});
</script>

<style scoped lang="scss"></style>
