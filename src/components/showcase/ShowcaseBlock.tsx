import { ParentComponent, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import Flex from "../flex";
import type { IComponentBaseProps } from "../types";
import "./ShowcaseBlock.css";

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

  return (
    <Flex
      direction="col"
      gap="md"
      {...others}
      data-theme={local.dataTheme}
      class={twMerge(local.class, local.className)}
    >
      <div class="showcase-block__container">
        <h3 class="showcase-block__title">{local.title}</h3>
        <Show when={local.description}>
          <p class="showcase-block__description">{local.description}</p>
        </Show>
        <div
          class={
            local.preview
              ? "showcase-block__content showcase-block__content--preview"
              : "showcase-block__content"
          }
        >
          {local.children}
        </div>
      </div>
    </Flex>
  );
};

export default ShowcaseBlock;
