import { Component, Show, createMemo, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import Badge from "../badge";
import Button from "../button";
import Flex from "../flex";
import Tooltip from "../tooltip";
import type { ComponentColor, IComponentBaseProps } from "../types";

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface ConnectionStatusProps extends IComponentBaseProps {
  /**
   * Current connection state
   */
  state: ConnectionState;

  /**
   * Error message to display when state is "error"
   */
  errorMessage?: string;

  /**
   * Service name to display
   */
  serviceName?: string;

  /**
   * URL to display
   */
  url?: string;

  /**
   * Whether the URL is custom (will be indicated in the tooltip)
   */
  isCustomUrl?: boolean;

  /**
   * Whether to show detailed information
   */
  showDetails?: boolean;

  /**
   * Whether to show the URL
   */
  showUrl?: boolean;

  /**
   * Whether to show the reconnect button when disconnected or error
   */
  showReconnectButton?: boolean;

  /**
   * Callback when reconnect button is clicked
   */
  onReconnect?: () => void | Promise<void>;

  /**
   * Custom class name
   */
  class?: string;

  /**
   * Custom class name (alias)
   */
  className?: string;

  /**
   * Custom style
   */
  style?: any;

  /**
   * Data theme
   */
  dataTheme?: string;
}

export const ConnectionStatus: Component<ConnectionStatusProps> = (props) => {
  const [local, others] = splitProps(props, [
    "state",
    "errorMessage",
    "serviceName",
    "url",
    "isCustomUrl",
    "showDetails",
    "showUrl",
    "showReconnectButton",
    "onReconnect",
    "class",
    "className",
    "style",
    "dataTheme",
  ]);

  const containerClasses = createMemo(() =>
    twMerge(local.class, local.className)
  );

  const getBadgeColor = createMemo((): ComponentColor => {
    switch (local.state) {
      case "connected":
        return "success";
      case "connecting":
        return "warning";
      case "error":
        return "error";
      default:
        return "neutral";
    }
  });

  const getStatusText = createMemo(() => {
    switch (local.state) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return local.errorMessage ? `Error: ${local.errorMessage}` : "Error";
      default:
        return "Disconnected";
    }
  });

  const formatUrl = (url: string) => {
    if (!url) return "";

    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.port ? `:${urlObj.port}` : "");
    } catch {
      return url;
    }
  };

  const getTooltipText = createMemo(() => {
    let tooltip = `Status: ${getStatusText()}`;

    if (local.url) {
      tooltip += `\nURL: ${local.url}`;

      if (local.isCustomUrl) {
        tooltip += " (Custom)";
      }
    }

    if (local.serviceName) {
      tooltip += `\nService: ${local.serviceName}`;
    }

    return tooltip;
  });

  const handleReconnect = async () => {
    if (local.onReconnect) {
      await local.onReconnect();
    }
  };

  const shouldShowReconnectButton = createMemo(
    () =>
      local.showReconnectButton &&
      (local.state === "disconnected" || local.state === "error")
  );

  const displayUrl = createMemo(() => (local.url ? formatUrl(local.url) : ""));

  return (
    <Flex
      align="center"
      gap="sm"
      class={containerClasses()}
      style={local.style}
      data-theme={local.dataTheme}
      {...others}
    >
      <Tooltip position="bottom" message={getTooltipText()}>
        <Flex align="center" gap="sm">
          <Show when={local.showDetails}>
            <Flex direction="col" align="start" gap="sm">
              <Badge color={getBadgeColor()} size="sm">
                {getStatusText()}
              </Badge>
              <Show when={local.serviceName}>
                <span class="text-xs text-base-content/70">
                  {local.serviceName}
                </span>
              </Show>
              <Show when={local.showUrl && displayUrl()}>
                <span class="text-xs font-mono text-base-content/70">
                  {displayUrl()}
                </span>
              </Show>
            </Flex>
          </Show>
          <Show when={!local.showDetails}>
            <Badge color={getBadgeColor()} size="sm">
              {getStatusText()}
            </Badge>
          </Show>
        </Flex>
      </Tooltip>

      <Show when={shouldShowReconnectButton()}>
        <Button
          onClick={handleReconnect}
          variant="outline"
          size="sm"
          disabled={local.state === "connecting"}
          loading={local.state === "connecting"}
        >
          Reconnect
        </Button>
      </Show>
    </Flex>
  );
};

export default ConnectionStatus;
