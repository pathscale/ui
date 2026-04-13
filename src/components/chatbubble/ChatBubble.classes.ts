export const CLASSES = {
  base: "chatbubble",
  align: {
    start: "chatbubble--start",
    end: "chatbubble--end",
  },
  slot: {
    header: "chatbubble__header",
    footer: "chatbubble__footer",
    avatar: "chatbubble__avatar",
    message: "chatbubble__message",
    time: "chatbubble__time",
  },
  color: {
    neutral: "chatbubble__message--neutral",
    primary: "chatbubble__message--primary",
    secondary: "chatbubble__message--secondary",
    accent: "chatbubble__message--accent",
    info: "chatbubble__message--info",
    success: "chatbubble__message--success",
    warning: "chatbubble__message--warning",
    error: "chatbubble__message--error",
  },
} as const;
