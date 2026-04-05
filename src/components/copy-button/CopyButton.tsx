import { createSignal, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { Show } from "solid-js";
import Button from "../button";

import type { IComponentBaseProps } from "../types";

export interface CopyButtonProps extends IComponentBaseProps {
  text: string;
  title?: string;
  onCopy?: () => void;
  children?: JSX.Element;
  copiedToken?: string | Component;
}

const CopyButton: Component<CopyButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    "text",
    "title",
    "class",
    "className",
    "onCopy",
    "children",
    "dataTheme",
    "copiedToken",
  ]);

  const [copied, setCopied] = createSignal(false);

  const copy = async () => {
    await navigator.clipboard.writeText(local.text);
    setCopied(true);
    local.onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const getContent = () => {
    if (local.children) return local.children;
    if (!copied()) return "Copy";
  };

  const getCopiedContent = () => {
    if (typeof local.copiedToken === "string") return local.copiedToken;
    if (local.copiedToken) return <local.copiedToken />;
    return "Copied!";
  };

  return (
    <Button
      type="button"
      size="sm"
      color="ghost"
      onClick={copy}
      title={local.title || "Copy to clipboard"}
      data-theme={local.dataTheme}
      class={twMerge(
        copied() ? "text-success" : "",
        local.class,
        local.className,
      )}
      {...others}
    >
      <Show when={!copied()}>{getContent()}</Show>
      <Show when={copied()}>{getCopiedContent()}</Show>
    </Button>
  );
};

export default CopyButton;
