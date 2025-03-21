import { customRef } from 'vue';

export function debouncedRef(value: unknown, delay = 200) {
  let timeout: number | undefined;
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      },
    };
  });
}
