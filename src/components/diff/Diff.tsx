import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export type DiffProps = JSX.HTMLAttributes<HTMLDivElement> & {
  "data-theme"?: string;
  secondItem: JSX.Element;
};

const Diff = (props: DiffProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "secondItem",
    "data-theme",
  ]);

  return (
    <div
      {...rest}
      class={twMerge("diff aspect-[16/9]", clsx(local.class))}
      data-theme={local["data-theme"]}
    >
      <div class="diff-item-1">{local.children}</div>
      <div class="diff-item-2">{local.secondItem}</div>
      <div class="diff-resizer" />
    </div>
  );
};

export default Diff;
