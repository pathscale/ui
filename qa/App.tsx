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
import "./index.css";
/*
 * Components are imported by name, not through `import * as UI`.
 *
 * A namespace import makes the bundler evaluate every module in the package,
 * including ones the harness never mounts. One of those runs code at module
 * scope that Blitz's JS runtime cannot execute, and the failure is not scoped
 * to that component: it throws during import and abandons the whole mount, so
 * every check on every component fails on an empty window.
 *
 * Naming them keeps a component that cannot even be imported to a red
 * `-mounts` check of its own, which is the outcome this harness exists to
 * produce.
 */
import {
  Accordion,
  Address,
  Alert,
  AuthCard,
  AuthFieldGroup,
  AuthFooterLinks,
  AuthMessage,
  AuthPoweredBy,
  AuthSubmitButton,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  ChatBubble,
  Checkbox,
  Chip,
  Collapsible,
  ColorSwatch,
  ColorWheel,
  ComplexColorWheel,
  Composer,
  CookieConsent,
  DataGrid,
  Dialog,
  Dock,
  Drawer,
  Dropdown,
  Empty,
  FieldGroup,
  Fieldset,
  FirefoxPWABanner,
  Flex,
  Footer,
  Form,
  GlowCard,
  Grid,
  Header,
  Icon,
  ImmersiveLanding,
  InlineEdit,
  Input,
  Label,
  LanguageSwitcher,
  Link,
  ListBox,
  LiveChatBubble,
  LiveChatPanel,
  MetalBorder,
  Navbar,
  PWAInstallPrompt,
  Pagination,
  PasswordField,
  PasswordRequirements,
  Popover,
  Progress,
  Radio,
  ScrollArea,
  Select,
  Separator,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  Tabs,
  Text,
  ThemeColorPicker,
  Toast,
  Tooltip,
} from "@pathscale/ui";
import {
  type Component,
  createErrorBoundary,
  createSignal,
  For,
  Show,
} from "solid-js";
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

const REGISTRY: Record<string, unknown> = {
  Accordion,
  Address,
  Alert,
  AuthCard,
  AuthFieldGroup,
  AuthFooterLinks,
  AuthMessage,
  AuthPoweredBy,
  AuthSubmitButton,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  ChatBubble,
  Checkbox,
  Chip,
  Collapsible,
  ColorSwatch,
  ColorWheel,
  ComplexColorWheel,
  Composer,
  CookieConsent,
  DataGrid,
  Dialog,
  Dock,
  Drawer,
  Dropdown,
  Empty,
  FieldGroup,
  Fieldset,
  FirefoxPWABanner,
  Flex,
  Footer,
  Form,
  GlowCard,
  Grid,
  Header,
  Icon,
  ImmersiveLanding,
  InlineEdit,
  Input,
  Label,
  LanguageSwitcher,
  Link,
  ListBox,
  LiveChatBubble,
  LiveChatPanel,
  MetalBorder,
  Navbar,
  PWAInstallPrompt,
  Pagination,
  PasswordField,
  PasswordRequirements,
  Popover,
  Progress,
  Radio,
  ScrollArea,
  Select,
  Separator,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  Tabs,
  Text,
  ThemeColorPicker,
  Toast,
  Tooltip,
};

/** Ids with a hand-written fixture above; everything else mounts generically. */
const HAND_WRITTEN = new Set(["dropdown", "select"]);

/*
 * Mount a component by name, with no knowledge of its API.
 *
 * Most components take children and an `aria-label`, which is all the paint
 * check needs: something on screen, addressable by the component's own name.
 * A component whose real use needs structure (a compound root plus parts, a
 * required prop) will render thin or not at all here, and its `-mounts` check
 * is what says so — a red check naming the component, rather than silence.
 */
function GenericFixture(props: { spec: ComponentSpec }) {
  const Component = () =>
    REGISTRY[props.spec.component] as
      | Component<Record<string, unknown>>
      | undefined;

  /*
   * A component that throws while rendering must not take the page with it.
   *
   * Several components read a context at render time and assume a provider:
   * mounted bare, `useContext` returns undefined and the call throws. Without a
   * boundary that error escapes the mount, so the window is empty and all 71
   * components report a missing control - the one failure mode this harness is
   * supposed to make impossible.
   *
   * Caught, the damage is confined to the component that caused it: its own
   * `-mounts` check goes red with the reason on screen, and every other
   * component still runs.
   */
  return createErrorBoundary(
    () => (
      <Show
        when={Component()}
        fallback={
          <span aria-label={props.spec.component}>
            {props.spec.component} is not exported
          </span>
        }
      >
        {(Resolved) => (
          <Dynamic
            component={Resolved()}
            aria-label={props.spec.component}
            {...(props.spec.props ?? {})}
          >
            {props.spec.component}
          </Dynamic>
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
    /*
     * The fallback is a named component rather than `COMPONENTS[0]`, so which
     * component the harness shows by default does not depend on alphabetical
     * order. `COMPONENTS[0]` is Accordion, whose bare mount throws, and a
     * throwing default meant every run opened on a broken page.
     */
    return (
      COMPONENTS.find((entry) => entry.id === id) ??
      COMPONENTS.find((entry) => entry.id === "button") ??
      COMPONENTS[0]
    );
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
        {/*
          Everything without a hand-written fixture is mounted generically: the
          export is looked up by name and rendered with an accessible name, so
          its `-mounts` check has something real to assert against.

          A generic mount cannot express a component's interaction, which is
          why those entries generate only their paint check. Writing a fixture
          above and filling in `subject` is the same act, and it is what
          upgrades a component to its kind's full set.
        */}
        <Show when={!HAND_WRITTEN.has(selected().id)}>
          <GenericFixture spec={selected()} />
        </Show>
      </div>
    </main>
  );
}

const root = document.getElementById("root");
if (root) render(() => <Harness />, root);
