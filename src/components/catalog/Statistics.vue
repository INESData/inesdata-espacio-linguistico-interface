<template>
    <div class="mt-8">
        <v-row>
          <v-col cols="12" md="4">
            <v-card min-height="150">
              <template v-slot:title>
                <router-link :to="{ name: 'corpus' }" style="text-decoration: none; color: inherit;">
                    {{ $t('commons.corpus.corpus') }}
                </router-link>
              </template>
              <template v-slot:text>
                <router-link :to="{ name: 'corpus' }" style="text-decoration: none; color: inherit;">
                    <h2>{{ corpusNb }}</h2>
                </router-link>
                <v-data-table
                  :headers="statisticsByLangHeaders"
                  :items="corpusByLang"
                  hide-default-header
                ><template #bottom></template>
                </v-data-table>

                <v-overlay
                    v-model="loadingCorpus"
                    contained
                    class="align-center justify-center"
                    persistent
                    :scrim="'grey'"
                    v-if="loadingCorpus"
                >
                    <v-progress-circular :size="50" class="primary" indeterminate></v-progress-circular>
                </v-overlay>
              </template>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card min-height="150">
              <template v-slot:title>
                <router-link :to="{ name: 'models' }" style="text-decoration: none; color: inherit;">
                    {{ $t('commons.model.model') }}
                </router-link>
              </template>
              <template v-slot:text>
                <router-link :to="{ name: 'models' }" style="text-decoration: none; color: inherit;">
                    <h2>{{ modelsNb }}</h2>
                </router-link>
                <v-data-table
                  :headers="statisticsByLangHeaders"
                  :items="modelsByLang"
                  hide-default-header
                ><template #bottom></template>
                </v-data-table>

                <v-overlay
                    v-model="loadingModels"
                    contained
                    class="align-center justify-center"
                    persistent
                    :scrim="'grey'"
                    v-if="loadingModels"
                >
                    <v-progress-circular :size="50" class="primary" indeterminate></v-progress-circular>
                </v-overlay>
              </template>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card min-height="150">
              <template v-slot:title>
                <router-link :to="{ name: 'lexical-resources' }" style="text-decoration: none; color: inherit;">
                    {{ $t('commons.lexical-resource.lexical-resource') }}
                </router-link>
              </template>
              <template v-slot:text>
                <router-link :to="{ name: 'lexical-resources' }" style="text-decoration: none; color: inherit;">
                    <h2>{{ lexicalResourcesNb }}</h2>
                </router-link>
                <v-data-table
                  :headers="statisticsByLangHeaders"
                  :items="lexicalResourcesByLang"
                  hide-default-header
                ><template #bottom></template>
                </v-data-table>

                <v-overlay
                    v-model="loadingLexicalResources"
                    contained
                    class="align-center justify-center"
                    persistent
                    :scrim="'grey'"
                    v-if="loadingLexicalResources"
                >
                    <v-progress-circular :size="50" class="primary" indeterminate></v-progress-circular>
                </v-overlay>
              </template>
            </v-card>
          </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import assetService from '@/services/asset-service';
import { defineComponent, onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'Statistics',
  setup() {

    const { t } = useI18n();

    const loadingCorpus = ref(true);
    const loadingModels = ref(true);
    const loadingLexicalResources = ref(true);

    const statisticsByLangHeaders = [
        {
          text: 'Language',
          value: 'name'
        },
        {
          text: 'Count',
          value: 'count'
        }
    ];

    const corpusNb = ref(0);
    const modelsNb = ref(0);
    const lexicalResourcesNb = ref(0);
    const corpusByLang: Ref<any[]> = ref([]);
    const modelsByLang: Ref<any[]> = ref([]);
    const lexicalResourcesByLang: Ref<any[]> = ref([]);

    const loadStatistics = async () => {
      const corpusStatistics = await assetService.getCatalogStatisticsByLang("corpus", t);
      corpusNb.value = corpusStatistics.countTotal;
      corpusByLang.value = corpusStatistics.statisticsByLang;
      loadingCorpus.value = false;
      const modelStatistics = await assetService.getCatalogStatisticsByLang("model", t);
      modelsNb.value = modelStatistics.countTotal;
      modelsByLang.value = modelStatistics.statisticsByLang;
      loadingModels.value = false;
      const lexicalResourcesStatistics = await assetService.getCatalogStatisticsByLang("lexical_resource", t);
      lexicalResourcesNb.value = lexicalResourcesStatistics.countTotal;
      lexicalResourcesByLang.value = lexicalResourcesStatistics.statisticsByLang;
      loadingLexicalResources.value = false;
    };

    onMounted(() => {
      loadStatistics();
    });

    return {
        loadingCorpus,
        loadingModels,
        loadingLexicalResources,
        corpusNb,
        modelsNb,
        lexicalResourcesNb,
        corpusByLang,
        modelsByLang,
        lexicalResourcesByLang,
        statisticsByLangHeaders,
    };
  },
});
</script>

<style scoped lang="scss">
.v-table {
  --v-table-header-height: 25px !important;
  --v-table-row-height: 35px !important;
}
</style>