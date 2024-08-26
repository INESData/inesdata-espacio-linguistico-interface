import axios from 'axios';
import notifications from '@/utils/notifications';
import keycloak from '@/keycloak';

export default function interceptorsSetup(): void {
  // REQUEST INTERCEPTOR -- before request is sent
  axios.interceptors.request.use((response) => {
    return response;
  });

  // RESPONSE INTERCEPTOR
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      
      //console.log("axios error", error.response.status, error.message);
      if (error.response && [401, 403].indexOf(error.response.status) !== -1) {
        keycloak.logout();
      }
      if (
        (error.response?.data?.message && error.response?.data?.message === 'canceled') ||
        (error.message && error.message === 'canceled')
      ) {
        return null;
      }

      let errorDetailMsg = error.message;
      if (error.response?.data && Array.isArray(error.response?.data) && error.response?.data.length > 0) {
        errorDetailMsg += ": " + error.response.data[0].message;
      }

      const { notification } = notifications();
      notification.error({title: '', message: errorDetailMsg });

      return Promise.reject(error);
    },
  );
}
