import { For, Show, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import Icon from "../icon";
import type { IComponentBaseProps } from "../types";
import type { PasswordRuleResult } from "../../passwordRules";

export type PasswordRequirementsProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    title?: JSX.Element;
    results: PasswordRuleResult[];
    itemClass?: string;
    metIcon?: JSX.Element;
    unmetIcon?: JSX.Element;
  };

const PasswordRequirements: Component<PasswordRequirementsProps> = (props) => {
  const [local, others] = splitProps(props, [
    "title",
    "results",
    "itemClass",
    "metIcon",
    "unmetIcon",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <div
      {...others}
      {...{ class: twMerge("space-y-2", local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="password-requirements"
    >
      <Show when={local.title}>
        <p class="text-xs font-medium uppercase opacity-70">{local.title}</p>
      </Show>

      <ul class="space-y-1">
        <For each={local.results}>
          {(rule) => (
            <li
              class={twMerge(
                "flex items-center gap-2 text-sm",
                rule.passed ? "text-success" : "opacity-75",
                local.itemClass,
              )}
              data-rule={rule.key}
              data-passed={rule.passed ? "true" : "false"}
            >
              <span class="inline-flex shrink-0 items-center justify-center" aria-hidden="true">
                <Show
                  when={rule.passed ? local.metIcon : local.unmetIcon}
                  fallback={
                    <Icon
                      width={14}
                      height={14}
                      name={rule.passed ? "icon-[lucide--check]" : "icon-[lucide--minus]"}
                    />
                  }
                >
                  {rule.passed ? local.metIcon : local.unmetIcon}
                </Show>
              </span>
              <span>{rule.message}</span>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};

export default PasswordRequirements;
