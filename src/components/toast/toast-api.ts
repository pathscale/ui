import type { ToastProps } from "./Toast";
import { toastStore } from "./toast.store";

export type ToastOptions = Omit<ToastProps, "message">;

export function createToastApi() {
  const show = (message: string, options: ToastOptions = {}) => {
    return toastStore.add({ ...options, message });
  };

  return {
    show,
    success: (msg: string, opts?: ToastOptions) =>
      show(msg, { ...opts, type: "success" }),
    error: (msg: string, opts?: ToastOptions) =>
      show(msg, { ...opts, type: "error" }),
    info: (msg: string, opts?: ToastOptions) =>
      show(msg, { ...opts, type: "info" }),
    warning: (msg: string, opts?: ToastOptions) =>
      show(msg, { ...opts, type: "warning" }),
    clear: toastStore.clear,
  };
}
