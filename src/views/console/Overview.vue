<template>
  <div class="mt-8">
    <v-row>
      <v-col cols="12" md="4">
        <v-card min-height="150">
          <template v-slot:title>{{ $t('commons.console.assets') }}</template>
          <template v-slot:text><h1>{{ assetsNb }}</h1></template>
          <template v-slot:append><CreateButton /></template>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card min-height="150">
          <template v-slot:title>{{ $t('commons.console.policies') }}</template>
          <template v-slot:text><h1>{{ policiesNb }}</h1></template>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card min-height="150">
          <template v-slot:title>{{ $t('commons.console.contracts') }}</template>
          <template v-slot:text><h1>{{ contractsNb }}</h1></template>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CreateButton from '../../components/common/CreateButton.vue';
import assetService from '@/services/asset-service';
import policyService from '@/services/policy-service';
import contractService from '@/services/contract-service';

export default defineComponent({
  name: 'OverviewView',
  components: { CreateButton },
  setup() {
    const { t } = useI18n();

    const assetsNb = ref(0);
    const policiesNb = ref(0);
    const contractsNb = ref(0);
    
    onMounted(async () => {
      assetsNb.value = (await assetService.readAll()).totalElements;
      policiesNb.value = (await policyService.readAll()).totalElements;
      contractsNb.value = (await contractService.readAll()).totalElements;
    });

    return {
      assetsNb, policiesNb, contractsNb
    };
  }
});
</script>

<style scoped lang="scss"></style>
