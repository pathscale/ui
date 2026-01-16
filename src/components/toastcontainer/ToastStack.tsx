import {
  type Component,
  type JSX,
  For,
  createMemo,
  createSignal,
  splitProps,
} from "solid-js";
import Alert from "../alert";
import Button from "../button";
import Toast from "../toast";
import type { ToastProps } from "../toast/Toast";
import { MotionDiv, resolvePreset } from "../../motion";
import type { MotionPreset } from "../../motion";
import { toastStore, type ToastItem } from "../../stores/toastStore";

export type ToastRenderer = (
  toast: ToastItem,
  dismiss: () => void
) => JSX.Element;

export type ToastStackProps = ToastProps & {
  motionPreset?: MotionPreset;
  motionPresetName?: string;
  reduceMotion?: boolean;
  renderToast?: ToastRenderer;
  expandOnClick?: boolean;
  collapsedCount?: number;
  collapsedOffset?: number;
  collapsedScale?: number;
};

const defaultRenderToast: ToastRenderer = (toast, dismiss) => (
  <Alert
    status={toast.type}
    class="flex justify-between items-center gap-4"
    style={{ "min-width": "20rem", "max-width": "32rem" }}
  >
    <span class="flex-1">{toast.message}</span>
    <Button
      size="sm"
      color="ghost"
      onClick={(event) => {
        event.stopPropagation();
        dismiss();
      }}
      class="ml-2 opacity-70 hover:opacity-100"
      aria-label="Dismiss notification"
    >
      x
    </Button>
  </Alert>
);

export const ToastStack: Component<ToastStackProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "motionPreset",
    "motionPresetName",
    "reduceMotion",
    "renderToast",
    "max",
    "expandOnClick",
    "collapsedCount",
    "collapsedOffset",
    "collapsedScale",
  ]);
  const [expanded, setExpanded] = createSignal(false);

  const resolvedPreset = createMemo<MotionPreset>(() => {
    if (local.motionPreset) return local.motionPreset;
    const name = local.motionPresetName ?? "toast";
    return resolvePreset(name, { reduceMotion: local.reduceMotion });
  });

  const visibleToasts = createMemo(() => {
    const list = toastStore.toasts();
    if (local.max && local.max > 0) {
      return list.slice(-local.max);
    }
    return list;
  });

  const allowCollapse = createMemo(() => {
    if (local.expandOnClick === false) return false;
    return visibleToasts().length > 1;
  });

  const isExpanded = createMemo(() => {
    if (!allowCollapse()) return true;
    return expanded();
  });

  const collapsedCount = createMemo(() => local.collapsedCount ?? 3);
  const collapsedOffset = createMemo(() => local.collapsedOffset ?? 10);
  const collapsedScale = createMemo(() => local.collapsedScale ?? 0.02);

  const stackToasts = createMemo(() => {
    const list = visibleToasts();
    if (isExpanded()) return list;
    const count = collapsedCount();
    if (count <= 0) return list;
    return list.slice(-count);
  });

  const renderToast = () => local.renderToast ?? defaultRenderToast;

  return (
    <Toast {...rest}>
      <div
        class={isExpanded() ? "flex flex-col gap-2" : "relative"}
        style={isExpanded() ? undefined : { "min-height": "3rem" }}
      >
        <For each={stackToasts()}>
          {(toast, index) => {
            const isTop = createMemo(
              () => index() === stackToasts().length - 1
            );
            const stackIndex = createMemo(
              () => stackToasts().length - 1 - index()
            );
            const onToggle = () => {
              if (!allowCollapse() || !isTop()) return;
              setExpanded((prev) => !prev);
            };

              const stackStyle = createMemo<JSX.CSSProperties>(() => {
                if (isExpanded()) return {};
                const offset = stackIndex() * collapsedOffset();
                const scale = 1 - stackIndex() * collapsedScale();
                return {
                  position: "absolute",
                  right: "0",
                  bottom: `${offset}px`,
                  transform: `scale(${scale})`,
                  "transform-origin": "right bottom",
                  "z-index": String(100 + index()),
                  transition: "transform 160ms ease-out",
                };
              });

            return (
              <div
                class={isTop() && !isExpanded() ? "cursor-pointer" : undefined}
                style={stackStyle()}
                onClick={onToggle}
              >
                <MotionDiv
                  initial={resolvedPreset().initial}
                  animate={resolvedPreset().animate}
                  exit={resolvedPreset().exit}
                  transition={resolvedPreset().transition}
                  isExiting={toast.isExiting}
                  onExitComplete={() => toastStore.removeToast(toast.id)}
                >
                  {renderToast()(toast, () => toastStore.dismissToast(toast.id))}
                </MotionDiv>
              </div>
            );
          }}
        </For>
      </div>
    </Toast>
  );
};

export default ToastStack;
