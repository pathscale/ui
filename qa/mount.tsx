/*
 * The shared mount every generated entry calls.
 *
 * One component, alone on the page, with nothing else to blame for its
 * behaviour. The entry that calls this is its own bundle, so a component whose
 * module throws on import takes down only its own page.
 *
 * The fixtures deliberately render a component the way the consuming
 * application does — controlled value plus an `onChange` that writes back —
 * because the defects worth catching live in exactly that wiring. An
 * uncontrolled component that updates its own display hides a broken
 * `onChange`, which is how a Select that could not select reported 2/2.
 */
/*
 * From their own modules, not the package root: a root import here would put
 * all 71 components back into every page's graph, which is the failure the
 * per-component entries exist to remove.
 */
import Dropdown from "@pathscale/ui/components/dropdown";
import Select from "@pathscale/ui/components/select";
import { createErrorBoundary, createSignal, For, Show } from "solid-js";
import { Dynamic, type JSX, render } from "@solidjs/web";
import { COMPONENTS, type ComponentSpec } from "./components";

function DropdownFixture(props: { spec: ComponentSpec }) {
  const options = () => props.spec.options ?? [];
  const [value, setValue] = createSignal(options()[1]?.value ?? "");
  const label = () => `Effort: ${value()}`;

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
  const label = () => `Session: ${current()?.label ?? ""}`;

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

/** Ids with a hand-written fixture; everything else mounts generically. */
const FIXTURES: Record<string, (props: { spec: ComponentSpec }) => JSX.Element> =
  {
    dropdown: DropdownFixture,
    select: SelectFixture,
  };

/*
 * Mount a component that was handed to us, with no knowledge of its API.
 *
 * The component arrives as an argument rather than being looked up here: each
 * generated entry imports its own module statically, which is what lets the
 * bundler keep one component per page. Resolving it here instead needed a
 * dynamic `require` of the package root, which is opaque to the bundler, so it
 * kept all 71 and every page carried every other component's module-scope code.
 *
 * Most components take children and an `aria-label`, which is all the paint
 * check needs: something on screen, addressable by the component's own name. A
 * component whose real use needs structure will render thin here, and its
 * `-mounts` check is what says so.
 */
function GenericFixture(props: {
  spec: ComponentSpec;
  component?: unknown;
}) {
  return createErrorBoundary(
    () => (
      <Show
        when={
          props.component as
            | ((props: Record<string, unknown>) => JSX.Element)
            | undefined
        }
        fallback={
          <span aria-label={props.spec.component}>
            {props.spec.component} is not exported
          </span>
        }
      >
        {(Component) => (
          /*
           * The accessible name lives on a wrapper, not on the component.
           *
           * `aria-label` passed to a component is only rendered if that
           * component spreads unknown props onto its root, and most do not:
           * Button rendered a 26px box with an empty name, which the check
           * reported as "not mounted" when it had in fact mounted perfectly.
           *
           * A labelled wrapper is addressable whatever the component does with
           * its props, so `<id>-mounts` measures what it claims to: something
           * reached the renderer with a box.
           */
          <>
            {/*
              A visible text label beside the component, rather than an
              `aria-label` on a wrapper.

              Blitz names a node from its rendered text; a bare `div` with
              `role="group"` and `aria-label` reached the tree as an unnamed
              `generic`, so the check could not address it even though the
              component had mounted. The heading above is named because it has
              text, and this follows the same rule.

              `data-qa` marks it as harness scaffolding rather than part of the
              component under test.
            */}
            
            <Dynamic component={Component()} {...(props.spec.props ?? {})}>
              {props.spec.component}
            </Dynamic>
          </>
        )}
      </Show>
    ),
    (error) => (
      <span aria-label={props.spec.component}>
        {props.spec.component} threw on mount: {String(error())}
      </span>
    ),
  ) as unknown as JSX.Element;
}

function Harness(props: { spec: ComponentSpec; component?: unknown }) {
  const Fixture = () => FIXTURES[props.spec.id] ?? GenericFixture;

  return (
    <main style={{ padding: "80px", "min-height": "100vh" }}>
      {/*
        Generous padding, and the fixture sits well clear of every edge: an
        overlay that opens upward needs somewhere to open into, and a menu
        clipped by the viewport is a different bug from a menu that cannot be
        reached.
      */}
      <h1 data-qa="harness-title">{props.spec.component}</h1>
      <div data-qa="fixture" role="region" aria-label="fixture">
        <Dynamic
          component={Fixture()}
          spec={props.spec}
          component={props.component}
        />
      </div>
    </main>
  );
}

/** Mount the component this page is for. Called by its generated entry. */
export function mountComponent(id: string, component?: unknown): void {
  const spec = COMPONENTS.find((entry) => entry.id === id);
  const root = document.getElementById("root");
  if (!spec || !root) return;
  render(() => <Harness spec={spec} component={component} />, root);
}
