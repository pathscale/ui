/*
 * The harness page: one component, mounted alone.
 *
 * `?c=<id>` picks the entry from `components.ts`. Nothing else is on the page,
 * so a control that misbehaves has no application state, no sibling overlay and
 * no scroll container to blame. Reload is a full reset, which is what lets each
 * check restore its own world by navigating rather than by undoing its effect.
 *
 * The fixture deliberately renders the component the way the application does
 * (controlled value plus an `onChange` that writes back), because the defects
 * worth catching live in exactly that wiring: an uncontrolled component that
 * updates its own display hides a broken `onChange`.
 */
/*
 * The theme, first. Component CSS is written against design tokens, so without
 * this every `var(--color-...)` falls back to nothing: the first harness build
 * rendered a Dropdown trigger 1168px wide with `bg=#00000000`, which reads as a
 * broken component and is really a missing stylesheet.
 */
import "../src/index.css";
import { Dropdown, Select } from "@pathscale/ui";
import { createSignal, For, Show } from "solid-js";
import { render } from "@solidjs/web";
import { COMPONENTS, type ComponentSpec } from "./components";

function DropdownFixture(props: { spec: ComponentSpec }) {
  const options = () => props.spec.options ?? [];
  const [value, setValue] = createSignal(options()[1]?.value ?? "");
  const label = () => `${props.spec.props.label}: ${value()}`;

  return (
    <Dropdown>
      <Dropdown.Trigger aria-label={label()}>{label()}</Dropdown.Trigger>
      <Dropdown.Menu>
        <For each={options()}>
          {(option) => (
            /*
             * `onClick` and an explicit `aria-label`, as the consuming
             * application uses. `Dropdown.Item` has no `onSelect`, and without
             * the label the item reaches the semantic tree with an empty name,
             * so `menuitem:low` matches nothing and every check fails on a
             * missing control rather than on the behaviour.
             */
            <Dropdown.Item
              aria-label={option.label}
              onClick={() => setValue(option.value)}
            >
              {option.label}
            </Dropdown.Item>
          )}
        </For>
      </Dropdown.Menu>
    </Dropdown>
  );
}

function SelectFixture(props: { spec: ComponentSpec }) {
  const options = () => props.spec.options ?? [];
  const [value, setValue] = createSignal(options()[0]?.value ?? "");
  const current = () => options().find((option) => option.value === value());
  const label = () => `${props.spec.props.label}: ${current()?.label ?? ""}`;

  return (
    <Select
      value={value()}
      onChange={(next) => typeof next === "string" && setValue(next)}
    >
      <Select.Trigger aria-label={label()}>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <Select.Listbox>
          <For each={options()}>
            {(option) => (
              <Select.Option value={option.value} textValue={option.label}>
                {option.label}
              </Select.Option>
            )}
          </For>
        </Select.Listbox>
      </Select.Popover>
    </Select>
  );
}

function Harness() {
  /*
   * Parsed by hand rather than with `URLSearchParams`, which Blitz's JS runtime
   * does not define: constructing one throws `ReferenceError` and the whole
   * mount is abandoned, so the harness shows an empty window and every check
   * fails on a missing control rather than on the component.
   *
   * `BLITZ_PREVIEW_COMPONENT` is the way in when there is no query string at
   * all, which is the ordinary case for a preview window pointed at a dist.
   */
  const selected = () => {
    const search = window.location?.search ?? "";
    const fromQuery = search
      .replace(/^\?/, "")
      .split("&")
      .map((pair) => pair.split("="))
      .find(([key]) => key === "c")?.[1];
    const id = fromQuery ?? (globalThis as { QA_COMPONENT?: string }).QA_COMPONENT;
    return COMPONENTS.find((entry) => entry.id === id) ?? COMPONENTS[0];
  };

  return (
    <main style={{ padding: "80px", "min-height": "100vh" }}>
      {/*
        Generous padding, and the fixture sits well clear of every edge: an
        overlay that opens upward needs somewhere to open into, and a menu
        clipped by the viewport is a different bug from a menu that cannot be
        reached.
      */}
      <h1 data-qa="harness-title">{selected().component}</h1>
      <div data-qa="fixture">
        <Show when={selected().id === "dropdown"}>
          <DropdownFixture spec={selected()} />
        </Show>
        <Show when={selected().id === "select"}>
          <SelectFixture spec={selected()} />
        </Show>
      </div>
    </main>
  );
}

const root = document.getElementById("root");
if (root) render(() => <Harness />, root);
