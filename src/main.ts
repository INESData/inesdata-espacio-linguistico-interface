import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import vuetify from './plugins/vuetify';

import i18n from '@/plugins/i18n';

import keycloak from './keycloak';
import { type KeycloakOnLoad } from 'keycloak-js';
import userService from './services/user-service';
import interceptorsSetup from '@/services/interceptors/interceptors';
import axios from 'axios';
import indexeddb from './utils/indexeddb';
import type { User } from './models/user';

async function initApp() {
  const app = createApp(App);

  app.use(createPinia());
  app.use(vuetify);
  app.use(i18n);
  app.use(router);

  app.mount('#app');
}

async function initFakeDb() {
  await indexeddb.init();
  const currentUser = await indexeddb.getUser(2);
  userService.onUserProfileLoaded({
    email_verified: true,
    preferred_username: currentUser.username,
    id: currentUser.id,
    roles: [],
  } as unknown as User);
}
await initFakeDb();
initApp();

router.beforeEach(async (to, from, next) => {
  //if (to.meta.requiresAuth) {
    if (!keycloak.authenticated) {
      const auth = await keycloak.init({
        onLoad: 'login-required' as KeycloakOnLoad,
        scope: '',
        pkceMethod: 'S256',
        redirectUri: window.location.origin + to.fullPath,
      });
      if (!auth) {
        window.location.reload();
        return;
      }
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + keycloak.token;
      interceptorsSetup();
      // await languageService.loadLanguages();
      const userProfile:any = await keycloak.loadUserInfo();
      userProfile.id = userProfile['sub'];
      userService.onUserProfileLoaded(userProfile as User);
      setInterval(async () => {
        try {
          const refreshed = await keycloak.updateToken(70);
          if (refreshed) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + keycloak.token;
          }
        } catch {
          // Vue.$log.error("Failed to refresh token");
        }
      }, 6000);
    }

    if (keycloak.authenticated) {
      // Verifica l'autenticazione utilizzando il token di accesso salvato localmente
      next();
    } else {
      // Reindirizza all'URL di login di Keycloak
      keycloak.login();
    }
  /*} else {
    // Rotte pubbliche, permetti l'accesso senza autenticazione
    next();
  }*/
});

export { keycloak };
