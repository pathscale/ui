import { type ComponentProps, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export type KbdProps = ComponentProps<"kbd">;

const Kbd = (props: KbdProps) => {
  const [local, rest] = splitProps(props, ["class"]);

  return <kbd {...rest} class={twMerge("kbd", clsx(local.class))} />;
};

export default Kbd;
