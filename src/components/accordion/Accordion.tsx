import {
  type Component,
  type JSX,
  createSignal,
  splitProps,
  Show,
} from "solid-js";
import {
  accordionContainerVariants,
  accordionHeaderVariants,
  accordionContentVariants,
} from "./Accordion.styles";
import type { VariantProps } from "@src/lib/style";

export type AccordionProps = {
  expanded?: boolean;
  disabled?: boolean;
  headerIsTrigger?: boolean;
  header: JSX.Element;
  content: JSX.Element;
} & VariantProps<typeof accordionContainerVariants> &
  JSX.HTMLAttributes<HTMLDivElement>;

const Accordion: Component<AccordionProps> = (props) => {
  const [local, variantProps, otherProps] = splitProps(
    props,
    ["expanded", "disabled", "headerIsTrigger", "header", "content"],
    ["expanded", "disabled"]
  );

  const [isOpen, setIsOpen] = createSignal(local.expanded ?? false);

  const handleToggle = () => {
    if (!local.disabled) setIsOpen((prev) => !prev);
  };

  return (
    <div
      class={accordionContainerVariants({
        ...variantProps,
        expanded: isOpen(),
        disabled: local.disabled,
      })}
      {...otherProps}
    >
      <div
        class={accordionHeaderVariants({
          headerIsTrigger: local.headerIsTrigger,
        })}
        onClick={local.headerIsTrigger ? handleToggle : undefined}
        role={local.headerIsTrigger ? "button" : undefined}
      >
        {local.header}
      </div>

      <Show when={isOpen()}>
        <div class={accordionContentVariants()}>{local.content}</div>
      </Show>
    </div>
  );
};

export default Accordion;
