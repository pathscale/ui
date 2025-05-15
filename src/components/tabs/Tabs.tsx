import {
  type Component,
  type JSX,
  createSignal,
  splitProps,
  For,
  Show,
  createMemo,
} from "solid-js";
import { tabsNavVariants, tabTriggerVariants } from "./Tabs.styles";
import type { VariantProps } from "@src/lib/style";

type TabItem = {
  label: string;
  content: JSX.Element;
  disabled?: boolean;
};

export type TabsProps = {
  items: TabItem[];
  value?: number;
  onChange?: (index: number) => void;
} & VariantProps<typeof tabsNavVariants>;

const Tabs: Component<TabsProps> = (props) => {
  const [local, variantProps, otherProps] = splitProps(
    props,
    ["items", "value", "onChange"],
    ["size", "type", "alignment", "expanded"]
  );

  const [internalActive, setInternalActive] = createSignal(local.value ?? 0);
  const isControlled = () => local.value !== undefined;
  const active = createMemo(() =>
    isControlled() ? local.value! : internalActive()
  );

  const handleChange = (i: number) => {
    const item = local.items[i];
    if (!item || item.disabled) return;

    if (!isControlled()) {
      setInternalActive(i);
    }

    local.onChange?.(i);
  };

  return (
    <div {...otherProps}>
      <nav class={tabsNavVariants(variantProps)}>
        <ul class="flex gap-2">
          <For each={local.items}>
            {(tab, i) => (
              <li>
                <button
                  class={tabTriggerVariants({
                    active: i() === active(),
                    disabled: tab.disabled,
                  })}
                  onClick={() => handleChange(i())}
                >
                  {tab.label}
                </button>
              </li>
            )}
          </For>
        </ul>
      </nav>
      <div class="pt-4">
        <Show when={local.items[active()]}>
          {local.items[active()]?.content}
        </Show>
      </div>
    </div>
  );
};

export default Tabs;
