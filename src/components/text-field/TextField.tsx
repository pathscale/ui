import "./TextField.css";
import {
  createContext,
  splitProps,
  useContext,
  type Accessor,
  type Component,
  type JSX,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type TextFieldVariant = "primary" | "secondary";

const VARIANT_CLASS_MAP: Record<TextFieldVariant, string> = {
  primary: "text-field--primary",
  secondary: "text-field--secondary",
};

export type TextFieldRenderProps = {
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
};

export type TextFieldContextValue = {
  variant: Accessor<TextFieldVariant>;
  fullWidth: Accessor<boolean>;
  isInvalid: Accessor<boolean>;
  isDisabled: Accessor<boolean>;
  isRequired: Accessor<boolean>;
};

export const TextFieldContext = createContext<TextFieldContextValue>();

export type TextFieldRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element | ((props: TextFieldRenderProps) => JSX.Element);
    variant?: TextFieldVariant;
    fullWidth?: boolean;
    isInvalid?: boolean;
    isDisabled?: boolean;
    disabled?: boolean;
    isRequired?: boolean;
  };

const TextFieldRoot: Component<TextFieldRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "variant",
    "fullWidth",
    "isInvalid",
    "isDisabled",
    "disabled",
    "isRequired",
  ]);

  const variant = () => local.variant ?? "primary";
  const fullWidth = () => Boolean(local.fullWidth);
  const isInvalid = () => Boolean(local.isInvalid);
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const isRequired = () => Boolean(local.isRequired);

  const renderChildren = () => {
    if (typeof local.children === "function") {
      return local.children({
        isInvalid: isInvalid(),
        isDisabled: isDisabled(),
        isRequired: isRequired(),
      });
    }

    return local.children;
  };

  return (
    <TextFieldContext.Provider value={{ variant, fullWidth, isInvalid, isDisabled, isRequired }}>
      <div
        {...others}
        class={twMerge(
          "text-field",
          VARIANT_CLASS_MAP[variant()],
          fullWidth() && "text-field--full-width",
          local.class,
          local.className,
        )}
        data-slot="textfield"
        data-invalid={isInvalid() ? "true" : undefined}
        data-disabled={isDisabled() ? "true" : undefined}
        data-required={isRequired() ? "true" : undefined}
        aria-invalid={isInvalid() ? "true" : undefined}
        aria-disabled={isDisabled() ? "true" : undefined}
        data-theme={local.dataTheme}
        style={local.style}
      >
        {renderChildren()}
      </div>
    </TextFieldContext.Provider>
  );
};

const TextField = Object.assign(TextFieldRoot, {
  Root: TextFieldRoot,
});

const useTextFieldContext = () => useContext(TextFieldContext);

export default TextField;
export { TextField, TextFieldRoot, useTextFieldContext };
export type { TextFieldRootProps as TextFieldProps };
