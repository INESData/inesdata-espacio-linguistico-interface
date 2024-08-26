import { reactive } from 'vue';

export type Notification = {
  id?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  visible: boolean;
  timer: number;
  title: string;
  message: string;
};

export type NotificationPayload = {
  type?: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
};

/* with reactive or ref the reactivity is broken outside the composable function */
const state = reactive<{ notifications: Notification[] }>({
  notifications: [],
});

export default function notifications() {
  function server(errors: any[] | undefined, _t?: (key: string) => string) {
    if (typeof errors !== 'undefined') {
      if (errors.length > 0) {
        errors.forEach((error) => {
          add({
            type: 'error',
            title:
              typeof _t !== 'undefined'
                ? _t(`errors.server.${error.errorInfo.type}`)
                : error.errorInfo.type,
            message: error.additionalInfo.message as string,
          });
        });
      }
    } else {
      add({
        type: 'error',
        title: typeof _t !== 'undefined' ? _t(`errors.server.ERROR`) : 'error',
        message:
          typeof _t !== 'undefined'
            ? _t(`errors.server.GENERIC_SERVER_ERROR`)
            : 'generic_server_error',
      });
    }
  }

  function success(payload: NotificationPayload) {
    add({ type: 'success', ...payload });
  }
  function info(payload: NotificationPayload) {
    add({ type: 'info', ...payload });
  }
  function warning(payload: NotificationPayload) {
    add({ type: 'warning', ...payload });
  }
  function error(payload: NotificationPayload) {
    add({ type: 'error', ...payload });
  }

  function add(payload: Required<NotificationPayload>) {
    const id = new Date();
    const n: Notification = {
      ...payload,
      visible: true,
      timer: 2500,
      id: id.toISOString() + state.notifications.length,
    };

    if (n.type === 'error')
      n.timer = n.timer * 3;

    // notification.timer = notification.timer ? notification.timer : 4000;
    let duplicate = false;
    state.notifications.forEach(
      (notification: { type: string; title: string; message: string; visible: boolean }) => {
        if (
          notification.type === n.type &&
          notification.title === n.title &&
          notification.message === n.message &&
          notification.visible
        ) {
          duplicate = true;
        }
      },
    );
    if (!duplicate) {
      state.notifications.push(n);
      setTimeout(() => {
        const notification = state.notifications.find((no) => no.id === n.id);
        if (notification) {
          notification.visible = false;
        }
      }, n.timer);
    }
  }

  /* function remove (notification) {
    state.notifications = state.notifications.filter(e => e !== notification);
  } */

  return {
    notifications: state.notifications,
    notification: {
      server,
      success,
      info,
      warning,
      error,
    },
  };
}
