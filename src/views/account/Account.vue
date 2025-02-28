<template>
  <div class="console-content">
    <h1>{{ $t('commons.account.account') }}</h1>
    <v-form fast-fail ref="assetform">
      <div class="header">
        <v-row>
          <v-col class="text-right">
            <v-btn prepend-icon="$logout" variant="flat" class="primary mb-2" @click="logout()">
              {{ $t('commons.account.logout') }}
            </v-btn>
          </v-col>
        </v-row>
        <v-divider class="mt-2 mb-10" />
      </div>
      <div>
        <v-row>
          <v-col cols="8">
            <v-select
                :label="$t('commons.locales.language')"
                :items="langs"
                :item-value="(item) => item"
                :item-title="(item) => $t('commons.locales.'+ item)"
                variant="outlined"
                density="compact"
                v-model="userLang"
                @update:model-value="changeLocale"
                id="input-language"
              />
          </v-col>
        </v-row>
      </div>
    </v-form>
  </div>
</template>

<script lang="ts">
import { type Ref, onMounted, watch } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import userService from '@/services/user-service';
import router from '@/router';

export default defineComponent({
  name: 'AccountView',
  components: {},
  setup() {
    const { t } = useI18n();
    const route = useRoute();

    const langs = ['EN', 'ES'];

    const userLang = ref('');

    onMounted(async () => {
      loadLang();
    });

    const loadLang = async () => {
      let lang = localStorage.getItem('userLang');
      if (!lang) {
        lang = langs[0];
      } else {
        if (!langs.includes(lang)) {
          lang = langs[0];
        }
      }
      userLang.value = lang;
    };

    function changeLocale(selectedLocale: string) {
      userService.setLanguage(selectedLocale);
    };

    function logout() {
      let currentUrl = window.location.href;
      currentUrl = currentUrl.replace("/account", "")
      userService.logout(currentUrl);
    }

    return {
      langs,
      userLang,
      logout,
      changeLocale
    };
  },
});
</script>

<style scoped lang="scss"></style>
