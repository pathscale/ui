import {
  createSignal,
  onMount,
  onCleanup,
  Show,
  type Component,
} from "solid-js";
import { removeElement } from "./utils/remove-element";
import Timer from "./utils/timer";
import { toastWrapperClass } from "./Toast.styles";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning" | "default";
  duration?: number | false;
  dismissible?: boolean;
  onClose?: () => void;
}

const Toast: Component<ToastProps> = (props) => {
  const [visible, setVisible] = createSignal(false);
  let rootRef: HTMLDivElement | undefined;
  let timer: Timer | null = null;

  const close = () => {
    timer?.stop();
    setVisible(false);
    setTimeout(() => {
      props.onClose?.();
      if (rootRef) removeElement(rootRef);
    }, 150);
  };

  onMount(() => {
    setVisible(true);
    if (props.duration !== false) {
      timer = new Timer(close, props.duration || 4000);
    }
  });

  onCleanup(() => {
    timer?.stop();
  });

  return (
    <div
      ref={rootRef}
      class={toastWrapperClass({
        type: props.type || "default",
        visible: visible(),
      })}
      role="alert"
      onClick={() => props.dismissible && close()}
      innerHTML={props.message}
    >
      <Show when={props.dismissible}>
        <button
          class="absolute top-2 right-2 text-white/80 hover:text-white transition"
          aria-label="Close toast"
        >
          ×
        </button>
      </Show>
    </div>
  );
};

export default Toast;
