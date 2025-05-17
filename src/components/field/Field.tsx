import {
  type Component,
  splitProps,
  type JSX,
} from "solid-js";
import { classes, type VariantProps, type ClassProps } from "@src/lib/style";
import {
  fieldWrapper,
  labelStyles,
  messageStyles,
} from "./Field.styles";

export type FieldProps = {
  /** Label text */
  label?: string;
  /** Helper or error message */
  message?: string;
  /** Visual intent */
  type?: "default" | "danger";
  /** Layout direction */
  horizontal?: boolean;
  /** Font/control size */
  size?: "sm" | "md" | "lg";
  /** Extra wrapper classes */
  className?: string;
} & VariantProps<typeof fieldWrapper>
  & ClassProps
  & Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children: JSX.Element;
  };

const Field: Component<FieldProps> = (props) => {
  const [local, variantProps, rest] = splitProps(
    props,
    ["label", "message", "className", "children"],
    ["horizontal", "size", "type", "grouped", "groupMultiline"]
  );

  return (
    <div class={classes(fieldWrapper(variantProps), local.className)} {...rest}>
    {local.label && (
      <label class={labelStyles(variantProps)}>
        {local.label}
      </label>
    )}

    {/* CONTENT SLOT: now flex when horizontal */}
    <div class={classes(
      variantProps.horizontal ? "flex items-center gap-2" : ""
    )}>
      {local.children}
    </div>

    {local.message && (
      <span class={messageStyles(variantProps)}>
        {local.message}
      </span>
    )}
  </div>
  );
};

export default Field;
