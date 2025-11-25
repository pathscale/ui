import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import CopyButton from "../copy-button/CopyButton";

export const StatCardSection = (section: string) => {
  return (
    props: JSX.HTMLAttributes<HTMLDivElement> & { copyable?: boolean },
  ) => {
    const [local, rest] = splitProps(props, ["class", "children", "copyable"]);

    let content = local.children;

    if (section === "figure") {
      content = (
        <div class="p-3 bg-primary/10 rounded-lg">
          <div class="flex items-center justify-center w-6 h-6 text-primary">
            {local.children}
          </div>
        </div>
      );
    }

    if (section === "value" && local.copyable) {
      content = (
        <CopyButton text={String(local.children)}>{local.children}</CopyButton>
      );
    }

    const classes =
      section === "title"
        ? "text-sm text-base-content/60"
        : section === "value"
          ? "text-2xl font-bold text-base-content"
          : section === "desc"
            ? "text-sm text-base-content/50"
            : section === "actions"
              ? "flex items-center gap-2"
              : "";

    return (
      <div
        {...rest}
        class={twMerge(classes, local.class)}
      >
        {content}
      </div>
    );
  };
};

export default StatCardSection;
