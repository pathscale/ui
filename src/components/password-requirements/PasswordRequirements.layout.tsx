import "./PasswordRequirements.css";
import type { JSX } from "@solidjs/web";
import {For, Show} from "solid-js";
import Icon from "../icon";
import type { UIBaseProps } from "../vocabulary";
import type { PasswordRuleResult } from "../../passwordRules";
import type { Layout } from "../../lib/layouts";
import { passwordRequirements } from "./PasswordRequirements.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type PasswordRequirementsProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    title?: JSX.Element;
    results: PasswordRuleResult[];
    metIcon?: JSX.Element;
    unmetIcon?: JSX.Element;
  };

/* -------------------------------------------------------------------------------------------------
 * PasswordRequirements
 *
 * Pass/fail is mirrored to `data-passed` and styled from the recipe, so the
 * met and unmet appearances stay in one place rather than in a class ternary.
 * -----------------------------------------------------------------------------------------------*/
export const PasswordRequirementsLayout: Layout<
  typeof passwordRequirements,
  PasswordRequirementsProps
> = () => (
  <div {...slot.root}>
    <Show when={local.title}>
      <p {...slot.title}>{local.title}</p>
    </Show>

    <ul {...slot.list}>
      <For each={local.results}>
        {(rule) => (
          <li
            {...slot.item}
            data-rule={rule.key}
            data-passed={rule.passed ? "true" : "false"}
          >
            <span {...slot.icon} aria-hidden="true">
              <Show
                when={rule.passed ? local.metIcon : local.unmetIcon}
                fallback={
                  <Icon
                    width={14}
                    height={14}
                    src={rule.passed ? "icon-[lucide--check]" : "icon-[lucide--minus]"}
                  />
                }
              >
                {rule.passed ? local.metIcon : local.unmetIcon}
              </Show>
            </span>
            <span {...slot.message}>{rule.message}</span>
          </li>
        )}
      </For>
    </ul>
  </div>
);
