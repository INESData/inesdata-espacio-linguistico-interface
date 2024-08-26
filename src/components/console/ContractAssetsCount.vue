<template>
  <v-tooltip location="top">
    <template v-slot:activator="{ props }">
      <p v-if="assets.length > 0" v-bind="props" class="nr-assets underline">
        {{ $t('console.contracts-page.assets-count', { count: assets.length }) }}
      </p>
      <p v-else v-bind="props" class="nr-assets underline">
        {{ $t('console.contracts-page.assets-count', { count: "All" }) }}
      </p>
    </template>

    <span v-for="asset in assets" :key="asset.id">
      {{ asset.name }}
      <br />
    </span>
  </v-tooltip>
</template>

<script lang="ts">
import { type Asset } from '@/models/asset';
import contractService from '@/services/contract-service';
import { type Ref, onMounted } from 'vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ContractAssetsCount',
  components: {},
  props: {
    contractId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const assets: Ref<Asset[]> = ref([]);
    onMounted(() => {
      getContractsAssetCount();
    });
    const getContractsAssetCount = async () => {
      assets.value = await contractService.getContractAssets(props.contractId);
    };
    return { assets };
  },
});
</script>

<style scoped lang="scss">
//
</style>
