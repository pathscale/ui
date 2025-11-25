import { type Component, For, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export interface PropDefinition {
  name: string;
  type: string;
  default?: string;
  description?: string;
  required?: boolean;
}

export interface PropsTableProps extends IComponentBaseProps {
  props: PropDefinition[];
}

const PropsTable: Component<PropsTableProps> = (props) => {
  const [local, others] = splitProps(props, [
    "props",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <div
      {...others}
      data-theme={local.dataTheme}
      class={twMerge("overflow-x-auto", local.class, local.className)}
    >
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-base-content/15">
            <th class="py-2 px-3 text-sm font-semibold text-base-content">
              Prop
            </th>
            <th class="py-2 px-3 text-sm font-semibold text-base-content">
              Type
            </th>
            <th class="py-2 px-3 text-sm font-semibold text-base-content">
              Default
            </th>
            <th class="py-2 px-3 text-sm font-semibold text-base-content">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          <For each={local.props}>
            {(prop) => (
              <tr class="border-b border-base-content/15 hover:bg-base-200/25">
                <td class="py-2 px-3 align-top">
                  <code class="text-sm font-mono font-medium text-base-content">
                    {prop.name}
                    <Show when={prop.required}>
                      <span class="text-error">*</span>
                    </Show>
                  </code>
                </td>
                <td class="py-2 px-3 align-top">
                  <code class="text-sm font-mono text-primary">
                    {prop.type}
                  </code>
                </td>
                <td class="py-2 px-3 align-top">
                  <Show when={prop.default}>
                    <code class="text-sm font-mono text-base-content/70">
                      {prop.default}
                    </code>
                  </Show>
                </td>
                <td class="py-2 px-3 text-sm text-base-content/70 align-top">
                  {prop.description}
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
};

export default PropsTable;
