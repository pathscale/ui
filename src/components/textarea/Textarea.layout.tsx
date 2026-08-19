import "./Textarea.css";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { Issue, State, UIBaseProps } from "../vocabulary";
import { resolveState } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Textarea.recipe";

export type TextareaVariant = "primary" | "secondary";

export type TextareaRootProps = Omit<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "children"
> &
  UIBaseProps & {
    variant?: TextareaVariant;
    fullWidth?: boolean;
    issues?: Issue[];
    state?: State;
    disabled?: boolean;
  };

const TextareaRoot: Layout<typeof componentRecipe, TextareaRootProps> = () => {
  const others = omit(
    props,
    "class",
    "dataTheme",
    "style",
    "variant",
    "fullWidth",
    "issues",
    "state",
    "disabled",
  );

  const variant = () => props.variant ?? "primary";
  const fullWidth = () => Boolean(props.fullWidth);
  const isInvalid = () =>
    Boolean(resolveState(props.state, props.issues) === "invalid");
  const isDisabled = () =>
    Boolean(props.state === "disabled") || Boolean(props.disabled);

  return (
    <textarea
      {...others}
      class={twMerge(
        CLASSES.base,
        CLASSES.variant[variant()],
        fullWidth() && CLASSES.flag.fullWidth,
        props.class,
      )}
      data-slot="textarea"
      data-invalid={isInvalid() ? "true" : undefined}
      data-disabled={isDisabled() ? "true" : undefined}
      aria-invalid={isInvalid() ? "true" : undefined}
      aria-disabled={isDisabled() ? "true" : undefined}
      data-theme={props.dataTheme}
      style={props.style}
      disabled={isDisabled()}
    />
  );
};

const Textarea = Object.assign(TextareaRoot, {
  Root: TextareaRoot,
});

export default Textarea;
export type { TextareaRootProps as TextareaProps };
export { Textarea, TextareaRoot };
