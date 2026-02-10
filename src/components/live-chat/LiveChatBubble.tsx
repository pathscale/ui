import { type Component, type JSX, createSignal, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { IComponentBaseProps } from "../types";
import LiveChatPanel from "./LiveChatPanel";
import type { LiveChatPanelProps } from "./LiveChatPanel";

export interface LiveChatBubbleProps extends IComponentBaseProps {
  /**
   * Position of the chat bubble
   * @default "bottom-right"
   */
  position?: "bottom-right" | "bottom-left";
  /**
   * ARIA label for the button
   * @default "Open chat"
   */
  "aria-label"?: string;
  /**
   * Number of unread messages to show in badge
   * @default 0
   */
  unreadCount?: number;
  /**
   * Props to pass to the LiveChatPanel when opened
   */
  panelProps?: Omit<LiveChatPanelProps, "onClose">;
  /**
   * Callback when chat is opened
   */
  onOpen?: () => void;
  /**
   * Callback when chat is closed
   */
  onClose?: () => void;
  /**
   * Custom children to render inside the button (replaces default icons)
   */
  children?: JSX.Element;
}

const LiveChatBubble: Component<LiveChatBubbleProps> = (props) => {
  const [local, others] = splitProps(props, [
    "position",
    "aria-label",
    "unreadCount",
    "panelProps",
    "onOpen",
    "onClose",
    "children",
    "class",
    "className",
    "style",
  ]);

  const [isOpen, setIsOpen] = createSignal(false);
  const [internalUnread, setInternalUnread] = createSignal(local.unreadCount ?? 0);

  const unreadCount = () => local.unreadCount ?? internalUnread();

  const toggleChat = () => {
    const newState = !isOpen();
    setIsOpen(newState);

    if (newState) {
      setInternalUnread(0);
      local.onOpen?.();
    } else {
      local.onClose?.();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    local.onClose?.();
  };

  const positionClasses = () => {
    const pos = local.position ?? "bottom-right";
    return pos === "bottom-left" ? "left-4" : "right-4";
  };

  const buttonClasses = () =>
    twMerge(
      `fixed bottom-5 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-primary text-primary-content rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center group`,
      positionClasses(),
      clsx(local.class, local.className)
    );

  return (
    <>
      <button
        {...others}
        onClick={toggleChat}
        class={buttonClasses()}
        style={local.style}
        aria-label={local["aria-label"] ?? "Open chat"}
      >
        {local.children ?? (
          <Show
            when={!isOpen()}
            fallback={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </Show>
        )}

        {/* Unread badge */}
        <Show when={unreadCount() > 0 && !isOpen()}>
          <span class="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-content text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount() > 9 ? "9+" : unreadCount()}
          </span>
        </Show>

        {/* Ping animation */}
        <span class="pointer-events-none absolute inset-0 rounded-full bg-primary animate-ping opacity-20 group-hover:opacity-0 transition-opacity" />
      </button>

      <Show when={isOpen()}>
        <LiveChatPanel {...(local.panelProps ?? {})} onClose={handleClose} />
      </Show>
    </>
  );
};

export default LiveChatBubble;
