import Keycloak from 'keycloak-js';
import {
  VITE_APP_KEYCLOAK_CLIENTID,
  VITE_APP_KEYCLOAK_REALM,
  VITE_APP_KEYCLOAK_ROOT,
} from './env-helper';
const keycloak = new Keycloak({
  url: VITE_APP_KEYCLOAK_ROOT,
  realm: String(VITE_APP_KEYCLOAK_REALM),
  clientId: String(VITE_APP_KEYCLOAK_CLIENTID),
});

export default keycloak;
