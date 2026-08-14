import "./Textarea.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { UIBaseProps, State } from "../vocabulary";
import { CLASSES } from "./Textarea.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Textarea.recipe";

export type TextareaVariant = "primary" | "secondary";

export type TextareaRootProps = Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, "children"> &
  UIBaseProps & {
    variant?: TextareaVariant;
    fullWidth?: boolean;
    isInvalid?: boolean;
    state?: State;
    disabled?: boolean;
  };

const TextareaRoot: Layout<typeof componentRecipe, TextareaRootProps> = () => {
  const [local, others] = splitProps(props, [
    "class",
    "dataTheme",
    "style",
    "variant",
    "fullWidth",
    "isInvalid",
    "state",
    "disabled",
  ]);

  const variant = () => local.variant ?? "primary";
  const fullWidth = () => Boolean(local.fullWidth);
  const isInvalid = () => Boolean(local.isInvalid);
  const isDisabled = () => Boolean((local.state === "disabled")) || Boolean(local.disabled);

  return (
    <textarea
      {...others}
      class={twMerge(
        CLASSES.base,
        CLASSES.variant[variant()],
        fullWidth() && CLASSES.flag.fullWidth,
        local.class,
      )}
      data-slot="textarea"
      data-invalid={isInvalid() ? "true" : undefined}
      data-disabled={isDisabled() ? "true" : undefined}
      aria-invalid={isInvalid() ? "true" : undefined}
      aria-disabled={isDisabled() ? "true" : undefined}
      data-theme={local.dataTheme}
      style={local.style}
      disabled={isDisabled()}
    />
  );
};

const Textarea = Object.assign(TextareaRoot, {
  Root: TextareaRoot,
});

export default Textarea;
export { Textarea, TextareaRoot };
export type { TextareaRootProps as TextareaProps };
