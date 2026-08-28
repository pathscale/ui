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
/*
 * Collapsible's parts are flat named exports; `Collapsible.Trigger` is
 * undefined. Dropdown, Select, Dialog, Popover and Tabs do attach their parts
 * to the root export, so their fixtures use that public compound API.
 */
import Collapsible, {
  CollapsibleContent,
  CollapsibleTrigger,
} from "@pathscale/ui/components/collapsible";
import { ComplexColorWheel } from "@pathscale/ui/components/color-wheel";
import Dialog from "@pathscale/ui/components/dialog";
import Dropdown from "@pathscale/ui/components/dropdown";
import InlineEdit from "@pathscale/ui/components/inline-edit";
import Popover from "@pathscale/ui/components/popover";
import Select from "@pathscale/ui/components/select";
import Tabs from "@pathscale/ui/components/tabs";
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
      {/*
        A plain marker inside the root. If this paints and the trigger does not,
        the root is rendering its children and the defect is in Trigger; if
        neither paints, the root itself is producing nothing.
      */}
      <span>select-root-reached</span>
      <Select.Trigger aria-label={label()}>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <Select.Listbox>
          <For each={options()}>
            {(option) => (
              <Select.Option
                value={option.value}
                textValue={option.label}
              >
                {option.label}
              </Select.Option>
            )}
          </For>
        </Select.Listbox>
      </Select.Popover>
    </Select>
  );
}

function InlineEditFixture() {
  const [value, setValue] = createSignal("Original title");
  return (
    <>
      <InlineEdit
        value={value()}
        label="Edit title"
        trigger={<span aria-hidden="true">edit</span>}
        onCommit={setValue}
      />
      <h2>Committed title: {value()}</h2>
    </>
  );
}

function CompletedAction(props: { component: string; complete: boolean }) {
  return (
    <Show when={props.complete}>
      <h2>Action result: {props.component} complete</h2>
    </Show>
  );
}

function ActionFixture(props: { spec: ComponentSpec; under?: unknown }) {
  const [complete, setComplete] = createSignal(false);
  return (
    <Show
      when={
        props.under as
          | ((props: Record<string, unknown>) => JSX.Element)
          | undefined
      }
      fallback={<span>{props.spec.component} is not exported</span>}
    >
      {(Component) => (
        <>
          <Dynamic
            component={Component()}
            {...(props.spec.props ?? {})}
            onClick={() => setComplete(true)}
          >
            {props.spec.subject}
          </Dynamic>
          <CompletedAction
            component={props.spec.component}
            complete={complete()}
          />
        </>
      )}
    </Show>
  );
}

function ComposerFixture(props: { spec: ComponentSpec; under?: unknown }) {
  const [complete, setComplete] = createSignal(false);
  return (
    <Show
      when={
        props.under as
          | ((props: Record<string, unknown>) => JSX.Element)
          | undefined
      }
      fallback={<span>{props.spec.component} is not exported</span>}
    >
      {(Component) => (
        <>
          <Dynamic
            component={Component()}
            value="QA message"
            onSubmit={() => setComplete(true)}
          />
          <CompletedAction
            component={props.spec.component}
            complete={complete()}
          />
        </>
      )}
    </Show>
  );
}

function DialogFixture() {
  return (
    <Dialog>
      <Dialog.Trigger>Open dialog</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Heading>Dialog outcome</Dialog.Heading>
        <Dialog.CloseTrigger>Close dialog</Dialog.CloseTrigger>
      </Dialog.Content>
    </Dialog>
  );
}

function PopoverFixture() {
  return (
    <Popover>
      <Popover.Trigger>Open popover</Popover.Trigger>
      <Popover.Content>
        <Popover.Heading>Popover outcome</Popover.Heading>
      </Popover.Content>
    </Popover>
  );
}

function TabsFixture() {
  const [selected, setSelected] = createSignal("first");
  return (
    <Tabs
      selectedKey={selected()}
      onSelectionChange={(key) => setSelected(String(key))}
    >
      <Tabs.List aria-label="Fixture tabs">
        <Tabs.Tab
          id="first"
          aria-label="First"
        >
          First
        </Tabs.Tab>
        <Tabs.Tab
          id="second"
          aria-label="Second"
        >
          Second
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel id="first">
        <h2>First panel</h2>
      </Tabs.Panel>
      <Tabs.Panel id="second">
        <h2>Second panel</h2>
      </Tabs.Panel>
    </Tabs>
  );
}

function ComplexColorWheelFixture() {
  const [strength, setStrength] = createSignal(10);
  return (
    <ComplexColorWheel
      value="#ffffff"
      onChange={() => {}}
      aria-label="Fixture colour"
      adjustments={[
        {
          id: "strength",
          label: "Strength",
          get value() {
            return strength();
          },
          stops: [10, 20],
          onChange: setStrength,
        },
      ]}
    />
  );
}

function LiveChatBubbleFixture(props: {
  spec: ComponentSpec;
  under?: unknown;
}) {
  const [complete, setComplete] = createSignal(false);
  return (
    <Show
      when={
        props.under as
          | ((props: Record<string, unknown>) => JSX.Element)
          | undefined
      }
      fallback={<span>{props.spec.component} is not exported</span>}
    >
      {(Component) => (
        <>
          <Dynamic
            component={Component()}
            onOpen={() => setComplete(true)}
          />
          <CompletedAction
            component={props.spec.component}
            complete={complete()}
          />
        </>
      )}
    </Show>
  );
}

function LiveChatPanelFixture(props: { spec: ComponentSpec; under?: unknown }) {
  const [complete, setComplete] = createSignal(false);
  return (
    <Show
      when={
        props.under as
          | ((props: Record<string, unknown>) => JSX.Element)
          | undefined
      }
      fallback={<span>{props.spec.component} is not exported</span>}
    >
      {(Component) => (
        <>
          <Dynamic
            component={Component()}
            onClose={() => setComplete(true)}
          />
          <CompletedAction
            component={props.spec.component}
            complete={complete()}
          />
        </>
      )}
    </Show>
  );
}

function PaginationFixture(props: { spec: ComponentSpec; under?: unknown }) {
  const [page, setPage] = createSignal(1);
  const [complete, setComplete] = createSignal(false);
  return (
    <Show
      when={
        props.under as
          | ((props: Record<string, unknown>) => JSX.Element)
          | undefined
      }
      fallback={<span>{props.spec.component} is not exported</span>}
    >
      {(Component) => (
        <>
          <Dynamic
            component={Component()}
            page={page()}
            total={2}
            onChange={(next: number) => {
              setPage(next);
              setComplete(true);
            }}
          />
          <CompletedAction
            component={props.spec.component}
            complete={complete()}
          />
        </>
      )}
    </Show>
  );
}

function FieldFixture(props: { spec: ComponentSpec; under?: unknown }) {
  const [value, setValue] = createSignal("");
  return (
    <Show
      when={
        props.under as
          | ((props: Record<string, unknown>) => JSX.Element)
          | undefined
      }
      fallback={<span>{props.spec.component} is not exported</span>}
    >
      {(Component) => (
        <Dynamic
          component={Component()}
          value={value()}
          aria-label={props.spec.subject}
          onInput={(
            event: InputEvent & {
              currentTarget: HTMLInputElement | HTMLTextAreaElement;
            },
          ) => setValue(event.currentTarget.value)}
        />
      )}
    </Show>
  );
}

function SliderFixture(props: { spec: ComponentSpec; under?: unknown }) {
  const [value, setValue] = createSignal(50);
  return (
    <Show
      when={
        props.under as
          | ((props: Record<string, unknown>) => JSX.Element)
          | undefined
      }
      fallback={<span>{props.spec.component} is not exported</span>}
    >
      {(Component) => (
        <Dynamic
          component={Component()}
          value={value()}
          onChange={setValue}
          label={props.spec.subject}
        />
      )}
    </Show>
  );
}

/*
 * A compound component is assembled from parts, so a bare mount renders an
 * empty box: `<Dialog>Dialog</Dialog>` has no Content to show. Each fixture
 * renders the smallest usable arrangement; the checks themselves open closed
 * states so opening remains part of the measured outcome.
 */
function CollapsibleFixture() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Collapsible</CollapsibleTrigger>
      <CollapsibleContent>
        <h2>Action result: Collapsible complete</h2>
      </CollapsibleContent>
    </Collapsible>
  );
}

/*
 * A toggle, mounted unchecked and controlled.
 *
 * The generic fixture passes no `checked`, so Switch, Radio and Checkbox
 * mounted uncontrolled and the tree reported `selected: true` before anything
 * had been pressed. The `-toggles` check then failed with "selected state
 * stayed true", which is indistinguishable between two very different things:
 * a component that ignores a click, and one that was already on and had
 * nowhere to go.
 *
 * Starting from `false` with a controlled signal separates them. If the state
 * flips, the component works and the old failure was the fixture's fault. If it
 * stays false, the component really does not respond and that is a defect worth
 * reporting.
 *
 * `under` rather than a static import: the generated entry already resolved the
 * component for this page, and importing three more here would put all three in
 * every page's bundle.
 */
function ToggleFixture(props: { spec: ComponentSpec; under?: unknown }) {
  const [on, setOn] = createSignal(false);
  return (
    <Show
      when={
        props.under as
          | ((props: Record<string, unknown>) => JSX.Element)
          | undefined
      }
      fallback={<span>{props.spec.component} is not exported</span>}
    >
      {(Component) => (
        <Dynamic
          component={Component()}
          checked={on()}
          onChange={() => setOn((previous) => !previous)}
          /*
           * Both spellings. These components disagree about which they take,
           * and a fixture that guesses wrong mounts an uncontrolled toggle
           * again, which is the bug this exists to rule out.
           */
          onInput={() => setOn((previous) => !previous)}
          aria-label={props.spec.component}
        />
      )}
    </Show>
  );
}

/*
 * Dock, with the items it requires.
 *
 * `items` is not optional and the layout reads `p.items.length` directly, so
 * mounting Dock generically threw `TypeError: not a callable function` before
 * anything rendered. The page came up with eight empty nodes and not even the
 * harness heading, which read as a component that renders nothing when it is a
 * component that was never given what it needs.
 *
 * `icon` is a `JSX.Element`, which is why this cannot be expressed as `props`
 * in `components.ts` the way a string or a number can.
 */
function DockFixture(props: { spec: ComponentSpec; under?: unknown }) {
  return (
    <Show
      when={
        props.under as
          | ((props: Record<string, unknown>) => JSX.Element)
          | undefined
      }
      fallback={<span>{props.spec.component} is not exported</span>}
    >
      {(Component) => (
        <Dynamic
          component={Component()}
          items={[
            { title: "Home", icon: <span>H</span> },
            { title: "Search", icon: <span>S</span> },
            { title: "Settings", icon: <span>G</span> },
          ]}
        />
      )}
    </Show>
  );
}

/** Ids with a hand-written fixture; everything else mounts generically. */
const FIXTURES: Record<
  string,
  // `under` is the resolved component, which the harness passes to whichever
  // fixture it selected. The hand-written fixtures that import their component
  // statically ignore it; `ToggleFixture` is generic over three components and
  // needs it.
  (props: { spec: ComponentSpec; under?: unknown }) => JSX.Element
> = {
  "auth-submit-button": ActionFixture,
  button: ActionFixture,
  checkbox: ToggleFixture,
  collapsible: CollapsibleFixture,
  "complex-color-wheel": ComplexColorWheelFixture,
  composer: ComposerFixture,
  dialog: DialogFixture,
  dock: DockFixture,
  dropdown: DropdownFixture,
  "inline-edit": InlineEditFixture,
  input: FieldFixture,
  link: ActionFixture,
  "live-chat-bubble": LiveChatBubbleFixture,
  "live-chat-panel": LiveChatPanelFixture,
  pagination: PaginationFixture,
  popover: PopoverFixture,
  radio: ToggleFixture,
  select: SelectFixture,
  slider: SliderFixture,
  switch: ToggleFixture,
  tabs: TabsFixture,
  textarea: FieldFixture,
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
function GenericFixture(props: { spec: ComponentSpec; under?: unknown }) {
  return createErrorBoundary(
    () => (
      <Show
        when={
          props.under as
            | ((props: Record<string, unknown>) => JSX.Element)
            | undefined
        }
        fallback={<span>{props.spec.component} is not exported</span>}
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

            <Dynamic
              component={Component()}
              {...(props.spec.props ?? {})}
            >
              {props.spec.component}
            </Dynamic>
          </>
        )}
      </Show>
    ),
    (error) => (
      <span>
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
      {/*
        `position: relative` and a minimum height.
        A component that positions itself absolutely is taken out of flow, so it
        contributes no height to a plain parent: the region measured 1184x0 and
        the `-renders` check reported eight components as rendering nothing when
        every one of them had painted. Badge paints a real 28x28 node, Live Chat
        Panel a 400x720 one.
        `relative` makes this region the containing block those components
        position against, so they land inside it rather than against the
        viewport, and the minimum height means the region itself always has area
        to be seen at. What the check then measures is whether the component put
        anything in it.
      */}
      <section
        data-qa="fixture"
        aria-label="fixture"
        style={{ position: "relative", "min-height": "8px" }}
      >
        {/*
          `under` rather than a second `component`: JSX takes the last of a
          duplicated prop, so passing the component under that name overwrote
          the fixture and `Dynamic` rendered the bare component instead. Every
          page then produced one empty box, which read as 71 broken components.
        */}
        <Dynamic
          component={Fixture()}
          spec={props.spec}
          under={props.component}
        />
      </section>
    </main>
  );
}

/** Mount the component this page is for. Called by its generated entry. */
export function mountComponent(id: string, component?: unknown): void {
  const spec = COMPONENTS.find((entry) => entry.id === id);
  const root = document.getElementById("root");
  if (!spec || !root) return;
  render(
    () => (
      <Harness
        spec={spec}
        component={component}
      />
    ),
    root,
  );
}
