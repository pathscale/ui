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
            <Dropdown.Item onSelect={() => setValue(option.value)}>
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
  const selected = () => {
    const id = new URLSearchParams(window.location.search).get("c");
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
