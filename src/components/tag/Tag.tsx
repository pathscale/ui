import { type Component, splitProps, createMemo, Show } from "solid-js";
import type { JSX } from "solid-js";
import { tagVariants } from "./Tag.styles";
import type { ClassProps, VariantProps } from "@src/lib/style";
import { classes } from "@src/lib/style";
import type { ComponentProps } from "solid-js";

export type TagProps = VariantProps<typeof tagVariants> &
  ClassProps &
  ComponentProps<"span"> & {
    closable?: boolean;
    attached?: boolean;
    ariaCloseLabel?: string;
    onClose?: (e: MouseEvent) => void;
    closeIcon?: JSX.Element;
    children?: JSX.Element;
  };

const Tag: Component<TagProps> = (props) => {
  const [localProps, variantProps, otherProps] = splitProps(
    props,
    [
      "closable",
      "attached",
      "onClose",
      "ariaCloseLabel",
      "closeIcon",
      "children",
      "type",
    ],
    ["class", ...tagVariants.variantKeys]
  );

  const isAttachedClosable = createMemo(
    () => localProps.attached && localProps.closable
  );
  const isClosable = createMemo(
    () => localProps.closable && !localProps.attached
  );

  const handleClose = (e: MouseEvent) => {
    if (typeof localProps.onClose === "function") {
      localProps.onClose(e);
    }
  };

  return (
    <div class={isAttachedClosable() ? "tags has-addons" : undefined}>
      <span
        class={classes(
          tagVariants({
            ...variantProps,
            closable: localProps.closable,
          }),
          variantProps.class
        )}
        {...otherProps}
      >
        <span class="truncate">{localProps.children}</span>

        <Show when={isClosable()}>
          <button
            type="button"
            aria-label={localProps.ariaCloseLabel}
            onClick={handleClose}
            class="ml-2 text-xs text-white hover:opacity-80"
          >
            {localProps.closeIcon ?? "×"}
          </button>
        </Show>
      </span>

      <Show when={isAttachedClosable()}>
        <button
          type="button"
          aria-label={localProps.ariaCloseLabel}
          onClick={handleClose}
          class={tagVariants({
            ...variantProps,
            class: "ml-1 text-xs hover:opacity-80",
          })}
        >
          {localProps.closeIcon ?? "×"}
        </button>
      </Show>
    </div>
  );
};

export default Tag;
