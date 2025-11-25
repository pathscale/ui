import { createSignal } from "solid-js";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  timestamp: number;
}

const [toasts, setToasts] = createSignal<ToastItem[]>([]);

let toastCounter = 0;

export const toastStore = {
  toasts,

  addToast: (message: string, type: ToastType = "info", duration = 8000) => {
    const id = `toast-${++toastCounter}`;
    const toast: ToastItem = {
      id,
      message,
      type,
      timestamp: Date.now(),
    };

    setToasts((prev) => [...prev, toast]);

    // Auto remove toast after duration
    setTimeout(() => {
      toastStore.removeToast(id);
    }, duration);

    return id;
  },

  removeToast: (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  },

  clearAll: () => {
    setToasts([]);
  },

  showError: (message: string) => toastStore.addToast(message, "error", 10000),
  showSuccess: (message: string) =>
    toastStore.addToast(message, "success", 6000),
  showWarning: (message: string) =>
    toastStore.addToast(message, "warning", 8000),
  showInfo: (message: string) => toastStore.addToast(message, "info", 6000),
};
