import type { JSX } from "solid-js";

export type ModalActionsProps = JSX.HTMLAttributes<HTMLDivElement>;

export default function ModalActions(props: ModalActionsProps): JSX.Element {
  return (
    <div
      {...props}
      class={props.class}
    />
  );
}
