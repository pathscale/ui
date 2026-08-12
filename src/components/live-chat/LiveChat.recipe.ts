import { recipe } from "solid-layouts";

/**
 * The clearest instance in the library of a variant written out by hand.
 *
 * Four elements each had a `--user` and an `--agent` variant, so the old map
 * carried eight names: `rowUser`, `rowAgent`, `avatarUser`, `avatarAgent`,
 * `messageColumnUser`, `messageColumnAgent`, `messageBubbleUser`,
 * `messageBubbleAgent`. They are one axis with two values reaching four
 * slots, and the component recombined them at each use site by picking the
 * right name from the pair.
 */
export const liveChat = recipe({
  component: "live-chat",
  element: "div",
  slots: {
    root: { base: "live-chat-panel" },
    bubble: { base: "live-chat-bubble" },
    bubbleIcon: { base: "live-chat-bubble__icon" },
    bubbleBadge: { base: "live-chat-bubble__badge" },
    bubblePing: { base: "live-chat-bubble__ping" },
    header: { base: "live-chat-panel__header" },
    headerTitleWrap: { base: "live-chat-panel__header-title-wrap" },
    headerIcon: { base: "live-chat-panel__header-icon" },
    headerTitle: { base: "live-chat-panel__header-title" },
    closeButton: { base: "live-chat-panel__close-button" },
    closeIcon: { base: "live-chat-panel__close-icon" },
    messages: { base: "live-chat-panel__messages" },
    row: { base: "live-chat-panel__row" },
    avatar: { base: "live-chat-panel__avatar" },
    messageColumn: { base: "live-chat-panel__message-column" },
    messageBubble: { base: "live-chat-panel__message-bubble" },
    messageText: { base: "live-chat-panel__message-text" },
    timestamp: { base: "live-chat-panel__timestamp" },
    empty: { base: "live-chat-panel__empty" },
    inputArea: { base: "live-chat-panel__input-area" },
    input: { base: "live-chat-panel__input" },
    sendButton: { base: "live-chat-panel__send-button" },
    spinner: { base: "live-chat-panel__spinner" },
  },
  props: {
    bubblePosition: {
      right: { bubble: "live-chat-bubble--right" },
      left: { bubble: "live-chat-bubble--left" },
    },
  },
  state: {
    author: {
      user: {
        row: "live-chat-panel__row--user",
        avatar: "live-chat-panel__avatar--user",
        messageColumn: "live-chat-panel__message-column--user",
        messageBubble: "live-chat-panel__message-bubble--user",
      },
      agent: {
        row: "live-chat-panel__row--agent",
        avatar: "live-chat-panel__avatar--agent",
        messageColumn: "live-chat-panel__message-column--agent",
        messageBubble: "live-chat-panel__message-bubble--agent",
      },
    },
  },
});
