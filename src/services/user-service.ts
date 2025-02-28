import { type KeycloakLogoutOptions, type KeycloakProfile /* , type KeycloakTokenParsed */ } from 'keycloak-js';
import { keycloak } from '@/main';
import { i18n } from '@/plugins/i18n';
import indexeddb from '@/utils/indexeddb';
import type { User } from '@/models/user';

class UserService {
  private _user: KeycloakProfile = {};
  private langs = ['EN', 'ES'];

  get currentUser(): KeycloakProfile {
    return this._user;
  }

  get lang(): string {
    return i18n.locale.value;
  }

  async setLanguage(lang: string) {
    localStorage.setItem('userLang', lang);
    i18n.locale.value = lang as 'EN' | 'ES';
  }

  async initUserLang() {
    let userLang = localStorage.getItem('userLang');
    const languages = this.langs;
    if (!userLang) {
      userLang = languages[0];
    } else {
      if (!languages.includes(userLang)) {
        userLang = languages[0];
      }
    }
    this.setLanguage(userLang);
  }

  onUserProfileLoaded(user: User /* , tokenParsed: KeycloakTokenParsed */) {
    this._user = {
      username: user.username,
      email: user.email,
      id: user.id,
      /* firstName: user.given_name,
      lastName: user.family_name, */
    };

    if (user.locale && (user.locale == 'es' || user.locale == 'en'))
      this.setLanguage(user.locale.toUpperCase());
    else
      this.initUserLang();
  }

  get accessToken(): string | undefined {
    return keycloak.token;
  }

  logout(redirectUrl?: string) {
    if (redirectUrl) {
      let options: KeycloakLogoutOptions = {
        redirectUri: redirectUrl,
      }
      keycloak.logout(options);
    }
    else
      keycloak.logout();    
  }

  async read(id: number): Promise<User> {
    return await indexeddb.getUser(id);
  }
}

export default new UserService();
