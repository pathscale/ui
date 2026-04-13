import { splitProps, type Component } from "solid-js";
import { twMerge } from "tailwind-merge";

import {
  TextArea,
  TextAreaRoot,
  type TextAreaProps as BaseTextAreaProps,
  type TextAreaRootProps as BaseTextAreaRootProps,
  type TextAreaVariant as BaseTextAreaVariant,
} from "../text-area";
import { CLASSES } from "./Textarea.classes";

export type TextareaVariant = BaseTextAreaVariant;
export type TextareaRootProps = BaseTextAreaRootProps;
export type TextareaProps = BaseTextAreaProps;

const TextareaRoot: Component<TextareaRootProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "className"]);

  return <TextAreaRoot {...others} {...{ class: twMerge(CLASSES.base, local.class, local.className) }} />;
};

const Textarea = Object.assign(TextareaRoot, {
  Root: TextareaRoot,
});

export default Textarea;
export { Textarea, TextArea, TextAreaRoot };
