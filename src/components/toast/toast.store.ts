import { createSignal } from "solid-js";
import type { ToastProps } from "./Toast";

export type InternalToast = ToastProps & { id: string };

const [toasts, setToasts] = createSignal<InternalToast[]>([]);

export const toastStore = {
  toasts,
  add(toast: Omit<InternalToast, "id">) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  },
  remove(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  },
  clear() {
    setToasts([]);
  },
};
