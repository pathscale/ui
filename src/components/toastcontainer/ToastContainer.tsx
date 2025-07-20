import Alert from "../alert";
import Button from "../button";
import Toast from "../toast";
import { type Component, For } from "solid-js";
import { toastStore } from "../../stores/toastStore";

export const ToastContainer: Component = () => {
  return (
    <Toast>
      <For each={toastStore.toasts()}>
        {(toast) => (
          <Alert
            status={toast.type}
            class="flex justify-between items-center gap-4"
            style={{ "min-width": "20rem", "max-width": "32rem" }}
          >
            <span class="flex-1">{toast.message}</span>
            <Button
              size="sm"
              color="ghost"
              onClick={() => toastStore.removeToast(toast.id)}
              class="ml-2 opacity-70 hover:opacity-100"
            >
              ✕
            </Button>
          </Alert>
        )}
      </For>
    </Toast>
  );
};