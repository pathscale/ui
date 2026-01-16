import { createSignal } from "solid-js";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  timestamp: number;
  duration: number;
  isExiting?: boolean;
  persist?: boolean;
}

const [toasts, setToasts] = createSignal<ToastItem[]>([]);

let toastCounter = 0;
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

const clearToastTimer = (id: string) => {
  const timer = toastTimers.get(id);
  if (!timer) return;
  clearTimeout(timer);
  toastTimers.delete(id);
};

const scheduleDismiss = (id: string, duration: number) => {
  if (duration <= 0) return;
  clearToastTimer(id);
  const timer = setTimeout(() => {
    toastStore.dismissToast(id);
  }, duration);
  toastTimers.set(id, timer);
};

export const toastStore = {
  toasts,

  addToast: (
    message: string,
    type: ToastType = "info",
    durationOrOptions?: number | { duration?: number; persist?: boolean }
  ) => {
    const hasOptions = durationOrOptions !== undefined;
    const duration =
      typeof durationOrOptions === "number"
        ? durationOrOptions
        : durationOrOptions?.duration ??
          (type === "error" && !hasOptions ? 0 : 8000);
    const persist =
      typeof durationOrOptions === "number"
        ? false
        : durationOrOptions?.persist ??
          (type === "error" && !hasOptions ? true : false);
    const id = `toast-${++toastCounter}`;
    const toast: ToastItem = {
      id,
      message,
      type,
      timestamp: Date.now(),
      duration,
      persist,
    };

    setToasts((prev) => [...prev, toast]);

    if (!persist) {
      scheduleDismiss(id, duration);
    }

    return id;
  },

  dismissToast: (id: string) => {
    clearToastTimer(id);
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id && !toast.isExiting
          ? { ...toast, isExiting: true }
          : toast
      )
    );
  },

  removeToast: (id: string) => {
    clearToastTimer(id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  },

  clearAll: () => {
    toastTimers.forEach((timer) => clearTimeout(timer));
    toastTimers.clear();
    setToasts([]);
  },

  showError: (message: string) =>
    toastStore.addToast(message, "error", { persist: true }),
  showSuccess: (message: string) =>
    toastStore.addToast(message, "success", 6000),
  showWarning: (message: string) =>
    toastStore.addToast(message, "warning", 8000),
  showInfo: (message: string) => toastStore.addToast(message, "info", 6000),
};
