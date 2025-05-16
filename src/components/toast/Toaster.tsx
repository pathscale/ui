import { For } from "solid-js";
import { toastStore } from "./toast.store";
import Toast from "./Toast";

const Toaster = () => {
  return (
    <div class="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 w-[300px] max-w-full">
      <For each={toastStore.toasts()}>
        {(toast) => (
          <Toast {...toast} onClose={() => toastStore.remove(toast.id)} />
        )}
      </For>
    </div>
  );
};

export default Toaster;
