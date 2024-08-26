import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes/routes';
// import userService from '@/services/user-service';
import { BASE_URL } from '@/env-helper';
const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes,
});
export default router;
