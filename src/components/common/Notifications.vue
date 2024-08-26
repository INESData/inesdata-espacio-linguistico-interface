<template>
  <div class="toasts-container">
    <v-alert
      v-for="notification in notifications"
      :key="notification.id"
      v-model="notification.visible"
      density="comfortable"
      variant="tonal"
      prominent
      :type="notification.type"
      :title="notification.title"
      :text="notification.message"
    ></v-alert>
  </div>
</template>

<script lang="ts">
import notifications from '@/utils/notifications';

export default {
  name: 'CustomNotifications',
  setup() {
    return notifications();
  },
};
</script>

<style lang="scss" scoped>
.toasts-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 400px;
  z-index: 1000;
}

.v-alert {
  background-color: white;

  & :deep(.v-icon) {
    height: 30px !important;
    width: 30px !important;
  }
}
</style>
