import type { JSX } from "solid-js";

export type ModalBodyProps = JSX.HTMLAttributes<HTMLDivElement>;

export default function ModalBody(props: ModalBodyProps): JSX.Element {
  return (
    <div
      {...props}
      class={props.class}
    />
  );
}
