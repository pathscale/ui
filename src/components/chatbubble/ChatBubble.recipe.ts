import { recipe } from "solid-layouts";

/**
 * `color` is slot-keyed: every one of its classes is
 * `chatbubble__message--*`, so it tints the message rather than the bubble.
 * The old map named them that way while filing them next to the root's own
 * `align` axis, which said nothing about where they applied.
 */
export const chatBubble = recipe({
  component: "chatbubble",
  element: "div",
  slots: {
    root: { base: "chatbubble" },
    header: { base: "chatbubble__header" },
    footer: { base: "chatbubble__footer" },
    avatar: { base: "chatbubble__avatar" },
    message: { base: "chatbubble__message" },
    time: { base: "chatbubble__time" },
  },
  props: {
    align: { start: "chatbubble--start", end: "chatbubble--end" },
    color: {
      neutral: { message: "chatbubble__message--neutral" },
      primary: { message: "chatbubble__message--primary" },
      secondary: { message: "chatbubble__message--secondary" },
      accent: { message: "chatbubble__message--accent" },
      info: { message: "chatbubble__message--info" },
      success: { message: "chatbubble__message--success" },
      warning: { message: "chatbubble__message--warning" },
      error: { message: "chatbubble__message--error" },
    },
  },
});
