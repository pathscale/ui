import { type ParentComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import CopyButton from "../copy-button";
import Flex from "../flex";
import type { IComponentBaseProps } from "../types";

export interface ShowcaseSectionProps extends IComponentBaseProps {
  id: string;
  title: string;
}

const ShowcaseSection: ParentComponent<ShowcaseSectionProps> = (props) => {
  const [local, others] = splitProps(props, [
    "id",
    "title",
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  const getSectionUrl = () => {
    const url = new URL(window.location.href);
    url.hash = local.id;
    return url.toString();
  };

  return (
    <div
      id={local.id}
      data-theme={local.dataTheme}
      {...others}
      class={twMerge(
        "p-3 bg-base-100 rounded-lg shadow-sm scroll-mt-6",
        local.class,
        local.className,
      )}
    >
      <Flex
        align="center"
        justify="between"
        gap="sm"
        class="mb-2"
      >
        <h2 class="text-xl font-semibold group/title">
          <Flex
            as="a"
            align="center"
            gap="sm"
            class="text-inherit hover:text-base-content"
          >
            {local.title}
            <span class="opacity-0 group-hover/title:opacity-100 text-base-content/70 transition-opacity">
              #
            </span>
          </Flex>
        </h2>
        <CopyButton
          text={getSectionUrl()}
          title="Copy link to section"
          class="opacity-0 group-hover:opacity-100 focus:opacity-100"
        />
      </Flex>
      <div class="space-y-3">{local.children}</div>
    </div>
  );
};

export default ShowcaseSection;
