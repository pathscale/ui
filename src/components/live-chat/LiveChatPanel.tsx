import { type Component, type JSX, createSignal, createEffect, For, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import Button from "../button";
import Flex from "../flex";
import Input from "../input";
import type { IComponentBaseProps } from "../types";
import type { ChatMessage, SendMessagePayload, SendMessageResponse } from "./types";

export interface LiveChatPanelProps extends IComponentBaseProps {
  /**
   * Callback when the panel close button is clicked
   */
  onClose: () => void;
  /**
   * Title shown in the header
   * @default "Chat with us"
   */
  title?: string;
  /**
   * Placeholder text for the input field
   * @default "Message support..."
   */
  placeholder?: string;
  /**
   * Label for the close button (for accessibility)
   * @default "Close chat"
   */
  closeLabel?: string;
  /**
   * Label for the send button
   * @default "Send"
   */
  sendLabel?: string;
  /**
   * Empty state message when there are no messages
   * @default "No messages yet. Start a conversation!"
   */
  emptyMessage?: string;
  /**
   * Enable mock mode with demo messages
   * @default false
   */
  mockMode?: boolean;
  /**
   * Initial messages to display (only used if mockMode is false)
   */
  messages?: ChatMessage[];
  /**
   * Callback when a message is sent
   * Should return the message ID and timestamp from the server
   */
  onSendMessage?: (payload: SendMessagePayload) => Promise<SendMessageResponse>;
  /**
   * Whether a message is currently being sent
   */
  isSending?: boolean;
}

const getMockMessages = (): ChatMessage[] => {
  const salesMessages: ChatMessage[] = [
    {
      messageId: "sales-1",
      content: "Hi! I'm interested in your product. Can you tell me more?",
      sender: "user",
      timestamp: Date.now() - 3600000,
    },
    {
      messageId: "sales-2",
      content:
        "Hello! Thanks for your interest. We offer flexible pricing plans starting at $49/month. Would you like to schedule a demo?",
      sender: "agent",
      timestamp: Date.now() - 3500000,
    },
    {
      messageId: "sales-3",
      content: "That sounds great! What features are included in the basic plan?",
      sender: "user",
      timestamp: Date.now() - 3400000,
    },
  ];

  const supportMessages: ChatMessage[] = [
    {
      messageId: "support-1",
      content: "I'm having trouble connecting. It keeps showing 'Connection Failed'.",
      sender: "user",
      timestamp: Date.now() - 7200000,
    },
    {
      messageId: "support-2",
      content:
        "I'm sorry to hear that. Let me help you troubleshoot. Can you tell me which browser you're using?",
      sender: "agent",
      timestamp: Date.now() - 7100000,
    },
    {
      messageId: "support-3",
      content: "I'm using Chrome version 121 on Windows 11",
      sender: "user",
      timestamp: Date.now() - 7000000,
    },
    {
      messageId: "support-4",
      content:
        "Thanks for that info. Let's try clearing your browser cache first. Can you go to Settings > Privacy and security > Clear browsing data?",
      sender: "agent",
      timestamp: Date.now() - 6900000,
    },
  ];

  return [...salesMessages, ...supportMessages].sort((a, b) => a.timestamp - b.timestamp);
};

const formatTime = (timestamp: number) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp));
};

const LiveChatPanel: Component<LiveChatPanelProps> = (props) => {
  const [local, others] = splitProps(props, [
    "onClose",
    "title",
    "placeholder",
    "closeLabel",
    "sendLabel",
    "emptyMessage",
    "mockMode",
    "messages",
    "onSendMessage",
    "isSending",
    "class",
    "className",
    "style",
  ]);

  const [internalMessages, setInternalMessages] = createSignal<ChatMessage[]>([]);
  const [inputValue, setInputValue] = createSignal("");
  const [sending, setSending] = createSignal(false);

  // Initialize with mock data or provided messages
  createEffect(() => {
    if (local.mockMode) {
      setInternalMessages(getMockMessages());
    } else if (local.messages) {
      setInternalMessages(local.messages);
    }
  });

  // Update messages when prop changes (for real-time updates)
  createEffect(() => {
    if (!local.mockMode && local.messages) {
      setInternalMessages(local.messages);
    }
  });

  const isSending = () => local.isSending ?? sending();

  const handleSend = async () => {
    const content = inputValue().trim();
    if (!content || isSending()) return;

    if (local.mockMode) {
      // In mock mode, just add the message locally
      const userMessage: ChatMessage = {
        messageId: `user-${Date.now()}`,
        content,
        sender: "user",
        timestamp: Date.now(),
      };
      setInternalMessages((prev) => [...prev, userMessage]);
      setInputValue("");

      // Simulate agent response after a delay
      setTimeout(() => {
        const agentMessage: ChatMessage = {
          messageId: `agent-${Date.now()}`,
          content: "Thanks for your message! This is a demo response.",
          sender: "agent",
          timestamp: Date.now(),
        };
        setInternalMessages((prev) => [...prev, agentMessage]);
      }, 1000);
    } else if (local.onSendMessage) {
      setSending(true);
      try {
        const response = await local.onSendMessage({ message: content });
        const userMessage: ChatMessage = {
          messageId: response.messageId,
          content,
          sender: "user",
          timestamp: response.timestamp,
        };
        setInternalMessages((prev) => [...prev, userMessage]);
        setInputValue("");
      } catch (error) {
        console.error("[LiveChatPanel] Failed to send message:", error);
      } finally {
        setSending(false);
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const classes = () =>
    twMerge(
      `fixed inset-0
      sm:inset-auto
      sm:bottom-20 sm:right-4
      md:bottom-24 md:right-6
      z-51
      w-full h-full
      sm:w-96 md:w-[400px]
      sm:h-[70vh]
      md:h-[75vh]
      lg:h-[80vh]
      sm:max-h-[800px]
      sm:min-h-[420px]
      bg-base-100
      sm:rounded-2xl
      shadow-2xl
      flex flex-col
      overflow-hidden`,
      clsx(local.class, local.className)
    );

  return (
    <div {...others} class={classes()} style={local.style}>
      {/* Header */}
      <div class="flex-shrink-0 bg-primary text-primary-content px-4 py-4 flex items-center justify-between">
        <Flex align="center" gap="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
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
          <h3 class="font-semibold text-lg">{local.title ?? "Chat with us"}</h3>
        </Flex>
        <button
          onClick={local.onClose}
          class="hover:bg-primary-focus rounded-lg p-1 transition-colors"
          aria-label={local.closeLabel ?? "Close chat"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
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
        </button>
      </div>

      {/* Messages area */}
      <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <For each={internalMessages()}>
          {(message) => {
            const isUser = message.sender === "user";
            return (
              <Flex direction={isUser ? "row-reverse" : "row"} gap="sm" class="w-full">
                <div
                  class={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isUser
                      ? "bg-primary text-primary-content"
                      : "bg-base-300 text-base-content"
                  }`}
                >
                  {isUser ? "U" : "A"}
                </div>

                <Flex direction="col" align={isUser ? "end" : "start"} class="max-w-[75%]">
                  <div
                    class={`px-3 py-2 rounded-2xl ${
                      isUser
                        ? "bg-primary text-primary-content rounded-tr-sm"
                        : "bg-base-200 text-base-content rounded-tl-sm"
                    }`}
                  >
                    <p class="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                  <span class="text-xs text-base-content/50 mt-1 px-1">
                    {formatTime(message.timestamp)}
                  </span>
                </Flex>
              </Flex>
            );
          }}
        </For>

        <Show when={internalMessages().length === 0}>
          <Flex justify="center" align="center" class="h-full text-base-content/50 text-sm">
            {local.emptyMessage ?? "No messages yet. Start a conversation!"}
          </Flex>
        </Show>
      </div>

      {/* Input area */}
      <div class="flex-shrink-0 border-t border-base-300 bg-base-100 p-3">
        <Flex gap="sm">
          <Input
            type="text"
            value={inputValue()}
            onInput={(e) => setInputValue(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            placeholder={local.placeholder ?? "Message support..."}
            disabled={isSending()}
            class="flex-1 px-3 py-2 bg-base-200 border border-base-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue().trim() || isSending()}
            class="px-4 py-2"
            color="primary"
          >
            <Show
              when={!isSending()}
              fallback={
                <span class="w-4 h-4 border-2 border-primary-content/30 border-t-primary-content rounded-full animate-spin inline-block" />
              }
            >
              {local.sendLabel ?? "Send"}
            </Show>
          </Button>
        </Flex>
      </div>
    </div>
  );
};

export default LiveChatPanel;
