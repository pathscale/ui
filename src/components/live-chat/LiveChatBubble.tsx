import "./LiveChat.css";
import { type Component, type JSX, createSignal, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import LiveChatPanel from "./LiveChatPanel";
import type { LiveChatPanelProps } from "./LiveChatPanel";
import { CLASSES } from "./LiveChat.classes";

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
   * Auto-scroll to the latest message when new messages are appended
   * @default true
   */
  autoScrollOnNewMessage?: boolean;
  /**
   * Auto-scroll behavior when moving to the latest message
   * @default "instant"
   */
  autoScrollBehavior?: "instant" | "smooth";
  /**
   * Reserved for backward compatibility.
   * Auto-scroll now always follows new messages when enabled.
   */
  stickToBottomThreshold?: number;
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
    "autoScrollOnNewMessage",
    "autoScrollBehavior",
    "stickToBottomThreshold",
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
    return pos === "bottom-left"
      ? CLASSES.bubble.position.left
      : CLASSES.bubble.position.right;
  };

  const buttonClasses = () =>
    twMerge(
      CLASSES.bubble.base,
      positionClasses(),
      local.class,
      local.className,
    );

  return (
    <>
      <button
        {...others}
        onClick={toggleChat}
        {...{ class: buttonClasses() }}
        style={local.style}
        aria-label={local["aria-label"] ?? "Open chat"}
      >
        {local.children ?? (
          <Show
            when={!isOpen()}
            fallback={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                {...{ class: CLASSES.bubble.icon }}
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
              {...{ class: CLASSES.bubble.icon }}
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
          <span {...{ class: CLASSES.bubble.badge }}>
            {unreadCount() > 9 ? "9+" : unreadCount()}
          </span>
        </Show>

        {/* Ping animation */}
        <span {...{ class: CLASSES.bubble.ping }} />
      </button>

      <Show when={isOpen()}>
        <LiveChatPanel
          {...(local.panelProps ?? {})}
          autoScrollOnNewMessage={
            local.panelProps?.autoScrollOnNewMessage ?? local.autoScrollOnNewMessage
          }
          autoScrollBehavior={
            local.panelProps?.autoScrollBehavior ?? local.autoScrollBehavior
          }
          stickToBottomThreshold={
            local.panelProps?.stickToBottomThreshold ?? local.stickToBottomThreshold
          }
          onClose={handleClose}
        />
      </Show>
    </>
  );
};

export default LiveChatBubble;
