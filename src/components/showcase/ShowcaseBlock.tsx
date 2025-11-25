import { type ParentComponent, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import Flex from "../flex";

export interface ShowcaseBlockProps extends IComponentBaseProps {
  title: string;
  description?: string;
  code?: string;
  preview?: boolean;
}

const ShowcaseBlock: ParentComponent<ShowcaseBlockProps> = (props) => {
  const [local, others] = splitProps(props, [
    "title",
    "description",
    "code",
    "preview",
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  const previewClass = local.preview
    ? "border bg-base-100 border-base-content/15 p-8 rounded-lg"
    : "";

  return (
    <Flex
      direction="col"
      gap="md"
      {...others}
      data-theme={local.dataTheme}
      class={twMerge(local.class, local.className)}
    >
      <div class="bg-base-200 shadow-sm p-6 rounded-lg">
        <h3 class="text-lg font-semibold mb-2 text-base-content">
          {local.title}
        </h3>
        <Show when={local.description}>
          <p class="text-base-content/70 mb-4">{local.description}</p>
        </Show>
        <div class={previewClass}>{local.children}</div>
      </div>
    </Flex>
  );
};
export default ShowcaseBlock;
