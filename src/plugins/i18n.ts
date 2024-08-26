import { createI18n } from 'vue-i18n';

import en from '@/locales/en.json';
import es from '@/locales/es.json';
import { VITE_APP_I18N_FALLBACK_LOCALE, VITE_APP_I18N_LOCALE } from '../env-helper';
const instance = createI18n({
  legacy: false,
  globalInjection: true,
  locale: VITE_APP_I18N_LOCALE || 'EN',
  fallbackLocale: VITE_APP_I18N_FALLBACK_LOCALE || 'EN',
  messages: {
    EN: en,
    ES: es,
  },
});

export default instance;

export const i18n = instance.global;
