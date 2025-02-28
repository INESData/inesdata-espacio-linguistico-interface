<template>
  <div class="access-details-content">
    <v-overlay
      v-model="loading"
      contained
      class="align-center justify-center"
      persistent
      :scrim="'transparent'"
      v-if="loading"
    >
      <v-progress-circular :size="50" class="primary" indeterminate></v-progress-circular>
    </v-overlay>
    <v-form v-if="asset" fast-fail ref="assetform" v-model="isFormValid" @submit.prevent="submit">
      <div class="header">
        <v-row>
          <v-col>
            <v-btn prepend-icon="$arrowLeft" variant="flat" class="primary mb-2" @click="goBack()">
              {{ $t('commons.back') }}
            </v-btn>
          </v-col>
          <v-col class="text-right">
            <v-btn class="mr-2" @click="goBack()" :disabled="!edited">
              {{ $t('commons.buttons.cancel') }}
            </v-btn>
            <v-btn class="primary pl-8 pr-8" :disabled="!edited" type="submit">
              {{ $t('commons.buttons.save') }}
            </v-btn>
          </v-col>
        </v-row>
        <v-divider class="mt-2 mb-10" />
      </div>
      <div>
        <v-row>
          <v-col cols="8">
            <v-text-field
              :label="$t('console.name')"
              :rules="[rules.required, rules.min, rules.nameMax]"
              variant="outlined"
              density="compact"
              autocomplete="off"
              v-model.trim="asset.name"
              id="input-asset-name"
            />
          </v-col>
          <v-col cols="8">
            <v-text-field
              :label="$t('console.version')"
              placeholder="1.0"
              :rules="[rules.required, rules.min, rules.nameMax]"
              variant="outlined"
              density="compact"
              autocomplete="off"
              v-model.trim="asset.version"
              id="input-asset-version"
            />
          </v-col>
          <v-col cols="8">
            <v-textarea
              :label="$t('console.short-description')"
              :rules="[rules.required, rules.min, rules.descMax]"
              variant="outlined"
              density="compact"
              autocomplete="off"
              v-model="asset.description"
              rows="3"
              no-resize
              id="input-asset-short-desc"
            />
          </v-col>
          <v-col cols="12">
            <div class="tabs">
              <v-btn :variant="selectedTab === 1 ? 'tonal' : 'text'" @click="selectedTab = 1">
                {{ $t('console.asset-info') }}
              </v-btn>
              <v-btn :variant="selectedTab === 2 ? 'tonal' : 'text'" @click="selectedTab = 2">
                {{ $t('console.contents') }}
              </v-btn>
            </div>
          </v-col>
          <v-col cols="8" v-show="selectedTab === 1">
            <div>
              <v-text-field
                :label="$t('console.keywords')"
                placeholder="blue,green,red"
                :rules="[rules.required, rules.min, rules.nameMax]"
                variant="outlined"
                density="compact"
                autocomplete="off"
                v-model.trim="asset.keywords"
                id="input-asset-keywords"
              />
              <v-select
                variant="outlined"
                density="compact"
                v-model="asset.categories"
                :items="filteredCategories"
                :label="$t('console.categories')"
                return-object
                item-title="name"
                multiple
                chips
              >
                <template v-slot:prepend-item>
                  <div class="pa-2">
                    <v-text-field
                      class="ma-0 pa-0"
                      variant="outlined"
                      density="compact"
                      autocomplete="off"
                      prepend-inner-icon="$magnify"
                      v-model="searchCategory"
                      hide-details
                      autofocus
                    />
                  </div>
                </template>
              </v-select>
              <v-select
                variant="outlined"
                density="compact"
                return-object
                :item-title="(item) => $t('catalog.filters.languages.options.' + item.name)"
                v-model="asset.languages"
                :items="filteredLanguages"
                :label="$t('console.languages')"
                multiple
                chips
              >
                <template v-slot:prepend-item>
                  <div class="pa-2">
                    <v-text-field
                      class="ma-0 pa-0"
                      variant="outlined"
                      density="compact"
                      autocomplete="off"
                      prepend-inner-icon="$magnify"
                      v-model="searchLang"
                      hide-details
                      autofocus
                    />
                  </div>
                </template>
              </v-select>
              <v-textarea
                :label="$t('console.text-content')"
                :rules="[rules.required, rules.min]"
                variant="outlined"
                density="compact"
                autocomplete="off"
                v-model="asset.textContent"
                rows="20"
                id="input-asset-text-content"
              />
            </div>
          </v-col>
          <v-col cols="8" v-show="selectedTab === 2">
            <div>

              <v-select
                :label="$t('console.content-type')"
                :items="contentTypes"
                item-value="value"
                :item-title="(item) => item.key != undefined ? item.key + ' (' + item.value + ')' : ''"
                :rules="[rules.required]"
                variant="outlined"
                density="compact"
                v-model.trim="asset.contenttype"
                id="input-content-type"
              >
              
              </v-select>

              <v-select
                :label="$t('console.destination')"
                :items="destinations"
                :rules="[rules.required]"
                variant="outlined"
                density="compact"
                v-model.trim="asset.dataDestination.type"
                id="input-destination"
              />

              <div v-if="asset.dataDestination.type == DestinationType.HttpData">
                <v-text-field
                  :label="$t('console.base-url')"
                  :rules="[rules.required, rules.min, rules.descMax]"
                  variant="outlined"
                  density="compact"
                  autocomplete="off"
                  v-model.trim="asset.dataDestination.baseUrl"
                  id="input-base-url"
                />
              </div>
              
              <div v-if="asset.dataDestination.type == DestinationType.AmazonS3">
                <v-text-field
                  :label="$t('console.region')"
                  :rules="[rules.required, rules.min, rules.nameMax]"
                  variant="outlined"
                  density="compact"
                  autocomplete="off"
                  v-model.trim="asset.dataDestination.region"
                  id="input-region"
                />
                <v-text-field
                  :label="$t('console.bucket-name')"
                  :rules="[rules.required, rules.min, rules.descMax]"
                  variant="outlined"
                  density="compact"
                  autocomplete="off"
                  v-model.trim="asset.dataDestination.bucketName"
                  id="input-bucket-name"
                />
                <v-text-field
                  :label="$t('console.key-name')"
                  :rules="[rules.required, rules.min, rules.descMax]"
                  variant="outlined"
                  density="compact"
                  autocomplete="off"
                  v-model.trim="asset.dataDestination.keyName"
                  id="input-key-name"
                />
              </div>

              <div v-if="asset.dataDestination.type == DestinationType.InesDataStore">
                <v-file-input
                  :label="$t('console.file-to-upload')"
                  :rules="[rules.requiredFile]"
                  variant="outlined"
                  density="compact"
                  v-model.trim="asset.dataDestination.fileToUpload"
                  id="input-file"
                />
                <v-text-field
                  :label="$t('console.folder')"
                  :rules="[rules.required, rules.min, rules.descMax]"
                  variant="outlined"
                  density="compact"
                  autocomplete="off"
                  v-model.trim="asset.dataDestination.folder"
                  id="input-folder"
                />
              </div>
              
            </div>
          </v-col>
        </v-row>
      </div>
    </v-form>
    <confirm-modal ref="confirmmodal" />
  </div>
</template>

<script lang="ts">
import { type Asset } from '@/models/asset';
import { type Category } from '@/models/category';
import { type Language } from '@/models/language';
import { EntityType } from '@/models/resource-type';
import { type ValidationRule } from '@/models/validationRule';
import assetService from '@/services/asset-service';
import categoryService from '@/services/category-service';
import languageService from '@/services/language-service';
import notifications from '@/utils/notifications';
import { computed } from 'vue';
import { type Ref, onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import ConfirmModal, { type ConfirmModalExpose } from '@/components/common/Confirm.vue';
import { DestinationType } from '@/models/destination-type';
import { type DataDestination } from '@/models/data-destination';
import { ContentTypes } from '@/models/content-types';

export default defineComponent({
  name: 'AssetDetailsView',
  components: { ConfirmModal },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const selectedTab = ref(1);
    const loading = ref(true);
    const asset: Ref<Asset | undefined> = ref();
    const assetBackup: Ref<Asset | undefined> = ref();

    let contentTypes: any[] = [];
    for (const [key, value] of Object.entries(ContentTypes)) {
      let contentTypeValue = {
        'key': key.replace("_", ""),
        'value': value
      };
      contentTypes.push(contentTypeValue);
    }

    let destinations: any[] = [];
    for (const destinationType of Object.values(DestinationType)) {
      const assetType = route.params.type as EntityType;
      if (assetType != EntityType.SERVICE || destinationType == DestinationType.HttpData)
        destinations.push(destinationType);
    }

    const assetform = ref<HTMLFormElement | null>(null);
    const isFormValid: Ref<boolean> = ref(true);

    const { notification } = notifications();

    const langs: Ref<Language[]> = ref([]);
    const categories: Ref<Category[]> = ref([]);

    const goBack = () => {
      if (window.history.length > 2) {
        router.back();
      } else {
        router.push({
          name: route.fullPath.split('/')[2],
        });
      }
    };

    onMounted(async () => {
      await loadLangs();
      await loadCategories();
      loadAsset();
    });

    const loadLangs = async () => {
      langs.value = await languageService.readAll();
    };

    const loadCategories = async () => {
      categories.value = await categoryService.readAll();
    };

    const searchCategory = ref('');
    const filteredCategories = computed(() => {
      return categories.value.filter((c) =>
        c.name.toLowerCase().includes(searchCategory.value.toLowerCase()),
      );
    });

    const searchLang = ref('');
    const filteredLanguages = computed(() => {
      return langs.value.filter((l) =>
        l.name.toLowerCase().includes(searchLang.value.toLowerCase()),
      );
    });

    const loadAsset = async () => {
      if (route.name === 'asset-create') {
        asset.value = {
          name: '',
          version: '',
          description: '',
          textContent: '',
          creationDate: 0,
          keywords: '',
          languages: [],
          categories: [],
          type: route.params.type as EntityType,
          contents: [],
          contenttype: '',
          dataDestination: {} as DataDestination
        };
      } else if (route.name === 'asset-edit') {
        asset.value = await assetService.read(route.params.id as string);
      }

      assetBackup.value = JSON.parse(JSON.stringify(asset.value));
      loading.value = false;
    };

    const rules: Ref<{ [key: string]: ValidationRule }> = ref({
      required: (value: string) => !!value || t('commons.errors.required'),
      requiredFile: (value: File[]) => (value && value.length > 0 && value[0] && value[0].size > 0) || t('commons.errors.required'),
      min: (value: string) =>
        (value && value.length >= 1) || t('commons.errors.field-too-short', { length: 1 }),
      nameMax: (value: string) =>
        (value && value.length <= 50) || t('commons.errors.field-too-long', { length: 50 }),
      descMax: (value: string) =>
        (value && value.length <= 140) || t('commons.errors.field-too-long', { length: 140 }),
    });

    const edited = computed(() => {
      return JSON.stringify(asset.value) !== JSON.stringify(assetBackup.value);
    });

    async function submit() {
      loading.value = true;
      const validation = await assetform.value?.validate();
      if (asset.value && isFormValid.value) {
        if (asset.value.id) {
          await doUpdate();
        } else {
          await doCreate();
        }
      } else {
        for (const error of validation.errors) {
          const elemName = t(error.id);
          for (const message of error.errorMessages) {
            notification.error({
              title: '',
              message: elemName + ': ' + message,
            });
          }
        }

        loading.value = false;
      }
    }

    async function doUpdate() {
      if (!asset.value) return;
      let success = await assetService.update('', asset.value);
      if (success)
        notification.success({
          type: 'success',
          title: '',
          message: t('commons.operations.updated'),
        });
      loadAsset();
      loading.value = false;
    }

    async function doCreate() {
      if (!asset.value) return;
      const newAsset:any = await assetService.create(asset.value);

      if (!newAsset["@id"]) {
        loading.value = false;
        return;
      }

      notification.success({
        type: 'success',
        title: '',
        message: asset.value.id ? t('commons.operations.updated') : t('commons.operations.created'),
      });
      loading.value = false;
      router.replace({
        name: 'asset-edit',
        params: { type: route.params.type, id: newAsset["@id"] },
      });
    }

    onBeforeRouteLeave(async (to, from) => {
      if (from.name === 'asset-create' && to.name === 'asset-edit') return true;
      return !(await checkUnsavedChanges());
    });

    const confirmmodal: Ref<ConfirmModalExpose | null> = ref(null);
    const checkUnsavedChanges = async () => {
      if (edited.value) {
        const confirm = await confirmmodal.value?.open({
          title: t('commons.operations.unsaved.title'),
          message: t('commons.operations.unsaved.message'),
          hardconfirm: undefined,
        });

        if (confirm) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    };

    return {
      goBack,
      rules,
      selectedTab,
      asset,
      loading,
      edited,
      isFormValid,
      submit,
      assetform,
      langs,
      categories,
      filteredCategories,
      filteredLanguages,
      searchCategory,
      searchLang,
      confirmmodal,
      DestinationType,
      destinations,
      contentTypes
    };
  },
});
</script>

<style scoped lang="scss">
.access-details-content {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  overflow-y: auto;
  position: absolute;
  top: 0;
  left: 0;
  padding: 0 30px;
}
.header {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  width: 100%;
  background-color: white;
  z-index: 10;
  padding-top: 30px;
}

.contract-item {
  border: 1px solid $gray-light;
}
.contract-info {
  color: $text-color-medium;
  font-size: 13px;
}
</style>
@/services/category-service
