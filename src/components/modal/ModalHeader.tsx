import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

export type ModalHeaderProps = JSX.HTMLAttributes<HTMLDivElement>;

export default function ModalHeader(props: ModalHeaderProps): JSX.Element {
  return (
    <div
      {...props}
      class={twMerge("w-full mb-8 text-xl", props.class)}
    />
  );
}
