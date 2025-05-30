import { type Component, splitProps, type JSX, createMemo } from "solid-js";
import { classes, type VariantProps, type ClassProps } from "@src/lib/style";
import { fieldWrapper, labelStyles, messageStyles } from "./Field.styles";

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
} & VariantProps<typeof fieldWrapper> &
  ClassProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children: JSX.Element;
  };

const Field: Component<FieldProps> = (props) => {
  const [local, variantProps, rest] = splitProps(
    props,
    ["label", "message", "className", "children"],
    ["horizontal", "size", "type", "grouped", "groupMultiline"]
  );

  const wrapperClass = createMemo(() =>
    classes(fieldWrapper(variantProps), local.className)
  );

  const labelClass = createMemo(() => labelStyles(variantProps));

  const messageClass = createMemo(() => messageStyles(variantProps));

  const contentClass = createMemo(() =>
    variantProps.horizontal ? "flex items-center gap-2" : ""
  );

  return (
    <div class={wrapperClass()} {...rest}>
      {local.label && <label class={labelClass()}>{local.label}</label>}

      {/* CONTENT SLOT: now flex when horizontal */}
      <div class={contentClass()}>{local.children}</div>

      {local.message && <span class={messageClass()}>{local.message}</span>}
    </div>
  );
};

export default Field;
