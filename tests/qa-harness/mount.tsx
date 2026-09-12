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
import Accordion, {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@pathscale/ui/components/accordion";
import Address from "@pathscale/ui/components/address";
import Alert from "@pathscale/ui/components/alert";
import Chip from "@pathscale/ui/components/chip";
import Icon from "@pathscale/ui/components/icon";
import { AuthPoweredBy } from "@pathscale/ui/components/auth-powered-by";
import { AuthFooterLinks } from "@pathscale/ui/components/auth-footer-links";
import { Breadcrumb } from "@pathscale/ui/components/breadcrumb";
import Card from "@pathscale/ui/components/card";
import DataGrid, { createDataGrid } from "@pathscale/ui/components/data-grid";
import { PasswordField } from "@pathscale/ui/components/password-field";
import ImmersiveLanding, {
  CookieConsent,
  FirefoxPWABanner,
  PWAInstallPrompt,
} from "@pathscale/ui/components/immersive-landing";
import { ConnectionSettings } from "@pathscale/ui/components/connection-settings";
import { createConnectionSettings } from "@pathscale/ui/hooks/connection";
import { ColorWheel, ComplexColorWheel } from "@pathscale/ui/components/color-wheel";
import { ColorWheelFlower } from "@pathscale/ui/components/color-wheel-flower";
import { createI18n, LanguageSwitcher } from "@pathscale/ui/components/language-switcher";
import Dialog from "@pathscale/ui/components/dialog";
import Drawer from "@pathscale/ui/components/drawer";
import Dropdown from "@pathscale/ui/components/dropdown";
import InlineEdit from "@pathscale/ui/components/inline-edit";
import Popover from "@pathscale/ui/components/popover";
import Select from "@pathscale/ui/components/select";
import Tabs from "@pathscale/ui/components/tabs";
import Button from "@pathscale/ui/components/button";
import Calendar from "@pathscale/ui/components/calendar";
import CloseButton from "@pathscale/ui/components/close-button";
import { Form } from "@pathscale/ui/components/form";
import Input from "@pathscale/ui/components/input";
import { createForm } from "@pathscale/ui/hooks/form";
import ButtonGroup from "@pathscale/ui/components/button-group";
import Checkbox from "@pathscale/ui/components/checkbox";
import CheckboxGroup from "@pathscale/ui/components/checkbox-group";
import ColorArea, { type ColorAreaValue } from "@pathscale/ui/components/color-area";
import ColorField from "@pathscale/ui/components/color-field";
import ColorPicker from "@pathscale/ui/components/color-picker";
import ColorSlider from "@pathscale/ui/components/color-slider";
import ColorSwatch from "@pathscale/ui/components/color-swatch";
import ColorSwatchPicker from "@pathscale/ui/components/color-swatch-picker";
import ComboBox from "@pathscale/ui/components/combo-box";
import DateField from "@pathscale/ui/components/date-field";
import DatePicker from "@pathscale/ui/components/date-picker";
import DateRangePicker, { type DateRangeValue } from "@pathscale/ui/components/date-range-picker";
import FlexGrid from "@pathscale/ui/components/flex-grid";
import InputOTP from "@pathscale/ui/components/input-otp";
import Join from "@pathscale/ui/components/join";
import Kbd from "@pathscale/ui/components/kbd";
import Menu from "@pathscale/ui/components/menu";
import ListBox, { ListBoxItem } from "@pathscale/ui/components/list-box";
import Meter from "@pathscale/ui/components/meter";
import NoiseBackground from "@pathscale/ui/components/noise-background";
import RadialProgress from "@pathscale/ui/components/radial-progress";
import Radio from "@pathscale/ui/components/radio";
import RadioGroup from "@pathscale/ui/components/radio-group";
import RangeCalendar, { type RangeCalendarValue } from "@pathscale/ui/components/range-calendar";
import { SizePicker } from "@pathscale/ui/components/size-picker";
import TimeField from "@pathscale/ui/components/time-field";
import Toolbar from "@pathscale/ui/components/toolbar";
import Tooltip from "@pathscale/ui/components/tooltip";
import Table from "@pathscale/ui/components/table";
import Toast, { toast } from "@pathscale/ui/components/toast";
import { ThemeColorPicker } from "@pathscale/ui/components/theme-color-picker";
import { VideoPreview } from "@pathscale/ui/components/video-preview";
import { createErrorBoundary, createSignal, For, onCleanup, Show } from "solid-js";
import { Dynamic, type JSX, render } from "@solidjs/web";
import { COMPONENTS, type ComponentSpec } from "./components";

/**
 * An in-memory `localStorage`, when the host has none.
 *
 * `qa-inspect-host` does not provide one, so every component that persists
 * anything took its "storage is unavailable" branch and the storage path went
 * untested -- silently, because that branch is deliberately quiet: a settings
 * panel still works for the session without it. Every browser has storage, so
 * a harness with none was testing the wrong shape of the thing.
 *
 * For the whole page, deliberately. It was briefly narrowed to the one fixture
 * that asserts persistence, because ThemeColorPicker stopped starting with it
 * installed. That turned out not to be about storage at all: the component
 * logs once about CSP when it gets far enough to check, and `ps-qa` was
 * reading the first line of the host's stdout as the descriptor path, so any
 * component that logged during startup looked like one that would not start.
 * Fixed in ps-qa 0.6.2. Narrowing this would have left the same trap set for
 * the next component that logs.
 *
 * Per page, and never shared: each component is served on its own page in its
 * own process, so this starts empty exactly as often as the fixtures do.
 */
installMemoryStorage();
function installMemoryStorage(): void {
  if (typeof globalThis.localStorage !== "undefined") return;
  const entries = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => {
        entries.set(key, String(value));
      },
      removeItem: (key: string) => {
        entries.delete(key);
      },
      clear: () => entries.clear(),
      key: (index: number) => [...entries.keys()][index] ?? null,
      get length() {
        return entries.size;
      },
    },
  });
}

function AccordionFixture() {
  const [value, setValue] = createSignal<string[]>([]);
  return (
    <>
      <Accordion value={value()} onValueChange={setValue}>
        <AccordionItem value="first">
          <AccordionTrigger>First section</AccordionTrigger>
          <AccordionContent><h2>First panel</h2></AccordionContent>
        </AccordionItem>
      </Accordion>
      <h2>Accordion value: {value().join(",") || "none"}</h2>
    </>
  );
}

function AddressFixture() {
  const [copied, setCopied] = createSignal("none");
  try {
    Object.defineProperty(globalThis.navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => undefined },
    });
  } catch {
    // A host-supplied clipboard is already sufficient.
  }
  return (
    <>
      <Address value="0x1234567890abcdef" onCopy={setCopied} />
      <h2>Address copied: {copied()}</h2>
    </>
  );
}

function AlertFixture() {
  const [dismissed, setDismissed] = createSignal(false);
  return (
    <Show when={!dismissed()} fallback={<h2>Alert dismissed</h2>}>
      <Alert onDismiss={() => setDismissed(true)} dismissLabel="Dismiss fixture alert">
        Fixture alert
      </Alert>
    </Show>
  );
}

function AuthPoweredByFixture() {
  const [activated, setActivated] = createSignal(false);
  const observeHoneyLink = (event: MouseEvent) => {
    if ((event.target as Element | null)?.closest("a[href='#honey']")) {
      setActivated(true);
    }
  };
  document.addEventListener("click", observeHoneyLink);
  onCleanup(() => document.removeEventListener("click", observeHoneyLink));
  return (
    <div>
      <AuthPoweredBy href="#honey" />
      <Show when={activated()}><h2>Honey link activated</h2></Show>
    </div>
  );
}

function AuthFooterLinksFixture() {
  const [activated, setActivated] = createSignal("none");
  return (
    <>
      <AuthFooterLinks
        items={[
          {
            key: "privacy",
            label: "Privacy fixture",
            href: "#privacy",
            onClick: () => setActivated("privacy"),
          },
          {
            key: "help",
            label: "Help fixture",
            onClick: () => setActivated("help"),
          },
          {
            key: "disabled",
            label: "Disabled fixture",
            disabled: true,
          },
        ]}
      />
      <h2>Auth footer action: {activated()}</h2>
    </>
  );
}

function BreadcrumbFixture() {
  const [activated, setActivated] = createSignal(false);
  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item
          href="#products"
          onClick={() => setActivated(true)}
        >
          Products fixture
        </Breadcrumb.Item>
        <Breadcrumb.Item isCurrent>Current fixture</Breadcrumb.Item>
      </Breadcrumb>
      <Show when={activated()}><h2>Breadcrumb activated</h2></Show>
    </>
  );
}

function CardFixture() {
  const [activated, setActivated] = createSignal(false);
  return (
    <>
      <Card isInteractive onClick={() => setActivated(true)}>
        Interactive fixture card
      </Card>
      <Show when={activated()}><h2>Card activated</h2></Show>
    </>
  );
}

function PasswordFieldFixture() {
  const [value, setValue] = createSignal("");
  return (
    <>
      <PasswordField
        label="Password"
        showLabel="Show password"
        hideLabel="Hide password"
        value={value()}
        onChange={setValue}
      />
      <h2>Password value: {value()}</h2>
    </>
  );
}

function ChipFixture() {
  const [removed, setRemoved] = createSignal(false);
  return (
    <Show when={!removed()} fallback={<h2>Chip removed</h2>}>
      <Chip
        onRemove={() => setRemoved(true)}
        removeButtonLabel="Remove fixture chip"
        endIcon={<Icon src="icon-[lucide--x]" />}
      >
        Fixture chip
      </Chip>
    </Show>
  );
}

function ColorSwatchFixture() {
  const [selected, setSelected] = createSignal("none");
  return (
    <>
      <ColorSwatch color="#0000ff" colorName="Fixture blue" onSelect={setSelected} />
      <h2>ColorSwatch selected: {selected()}</h2>
    </>
  );
}

function ListBoxFixture() {
  const [selected, setSelected] = createSignal(new Set<string>());
  return (
    <>
      <ListBox
        selectionMode="single"
        selectedKeys={selected()}
        onSelectionChange={setSelected}
      >
        <ListBoxItem id="first" textValue="First item">First item</ListBoxItem>
        <ListBoxItem id="second" textValue="Second item">Second item</ListBoxItem>
      </ListBox>
      <h2>ListBox value: {[...selected()].join(",") || "none"}</h2>
    </>
  );
}

function TooltipFixture() {
  return (
    <Tooltip delay={0} closeDelay={0}>
      <Tooltip.Trigger><Button>Tooltip target</Button></Tooltip.Trigger>
      <Tooltip.Content>Fixture tooltip</Tooltip.Content>
    </Tooltip>
  );
}

function ThemeColorPickerFixture() {
  const [theme, setTheme] = createSignal("none");
  return (
    <>
      <ThemeColorPicker
        aria-label="Change theme color"
        storagePrefix="qa-theme-color"
        onThemeSwitch={setTheme}
      />
      <h2>ThemeColorPicker theme: {theme()}</h2>
    </>
  );
}

function CookieConsentFixture() {
  const [managed, setManaged] = createSignal("none");
  const [accepted, setAccepted] = createSignal("none");
  const [declined, setDeclined] = createSignal("none");
  const consent = (prefix: string) => ({
    consentKey: `qa-cookie-${prefix}-consent`,
    analyticsKey: `qa-cookie-${prefix}-analytics`,
    marketingKey: `qa-cookie-${prefix}-marketing`,
  });
  return (
    <>
      <CookieConsent
        id="qa-cookie-m"
        storageKeys={consent("m")}
        texts={{ acceptAll: "Accept all M", decline: "Decline M", manage: "Manage M", manageTitle: "Manage M preferences", save: "Save M", marketing: "Marketing M" }}
        onConsentChange={({ type }) => setManaged(type)}
      />
      <CookieConsent
        id="qa-cookie-a"
        storageKeys={consent("a")}
        texts={{ acceptAll: "Accept all A", decline: "Decline A", manage: "Manage A", marketing: "Marketing A" }}
        onConsentChange={({ type }) => setAccepted(type)}
      />
      <CookieConsent
        id="qa-cookie-d"
        storageKeys={consent("d")}
        texts={{ acceptAll: "Accept all D", decline: "Decline D", manage: "Manage D", marketing: "Marketing D" }}
        onConsentChange={({ type }) => setDeclined(type)}
      />
      <h2>Cookie consent M: {managed()}</h2>
      <h2>Cookie consent A: {accepted()}</h2>
      <h2>Cookie consent D: {declined()}</h2>
    </>
  );
}

function DropdownFixture(props: { spec: ComponentSpec }) {
  const options = () => props.spec.options ?? [];
  const [value, setValue] = createSignal(options()[1]?.value ?? "");
  const label = () => `Effort: ${value()}`;

  return (
    <Dropdown id="qa-dropdown">
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
      id="qa-select"
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

const languageFixtureStore = createI18n({
  languages: [
    { code: "en", name: "English" },
    { code: "zh", name: "Chinese" },
  ],
  defaultLanguage: "en",
  storageKey: "qa-language",
});

function LanguageSwitcherFixture() {
  return (
    <LanguageSwitcher
      id="qa-language-switcher"
      i18n={languageFixtureStore}
      currentLanguageLabel="Current language"
      optionsLabel="Language options"
    />
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

function CloseButtonFixture(props: {
  spec: ComponentSpec;
}) {
  const [complete, setComplete] = createSignal(false);
  return (
    <>
      <CloseButton
        aria-label={props.spec.subject}
        onClick={() => setComplete(true)}
      />
      <CompletedAction
        component={props.spec.component}
        complete={complete()}
      />
    </>
  );
}

function ComposerFixture(props: { spec: ComponentSpec; under?: unknown }) {
  const [value, setValue] = createSignal("");
  const [submitted, setSubmitted] = createSignal("none");
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
            value={value()}
            placeholder="Fixture message"
            onChange={setValue}
            onSubmit={setSubmitted}
          />
          <h2>Composer draft: {value()}</h2>
          <h2>Composer submitted: {submitted()}</h2>
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

function DrawerFixture() {
  return (
    <Drawer placement="left">
      <Drawer.Trigger as={Button}>Open drawer</Drawer.Trigger>
      <Drawer.Backdrop>
        <Drawer.Content>
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>Drawer outcome</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>The drawer is visibly inside the viewport.</Drawer.Body>
            <Drawer.Footer>
              <Drawer.CloseTrigger>Close drawer</Drawer.CloseTrigger>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
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
  const [value, setValue] = createSignal("#ffffff");
  return (
    <div
      ref={() => {
        queueMicrotask(() => {
          document.getElementById("root")?.style.setProperty("zoom", "1.16");
        });
      }}
    >
      <ComplexColorWheel
        value={value()}
        onChange={setValue}
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
    </div>
  );
}

function ColorWheelFlowerFixture() {
  const [value, setValue] = createSignal("#ffffff");
  const [changed, setChanged] = createSignal(false);
  return (
    <>
      <ColorWheelFlower
        color={value()}
        onChange={(next) => {
          setValue(next.hex);
          setChanged(true);
        }}
      />
      <Show when={changed()}><h2>ColorWheelFlower changed</h2></Show>
    </>
  );
}

function ColorWheelFixture() {
  const [value, setValue] = createSignal("#ffffff");
  return (
    <>
      <ColorWheel value={value()} onChange={setValue} aria-label="Fixture color wheel" />
      <h2>ColorWheel value: {value()}</h2>
    </>
  );
}

function DataGridFixture() {
  const grid = createDataGrid<{ id: string; name: string }>({
    pageSize: 2,
    selection: "multiple",
  });
  grid.addColumn("name", "Name", "string", {
    sortable: true,
    searchable: true,
  });
  grid.setRows([
    { id: "alpha", name: "Alpha" },
    { id: "beta", name: "Beta" },
    { id: "gamma", name: "Gamma" },
  ]);

  const [sort, setSort] = createSignal("none");
  const [page, setPage] = createSignal(0);
  const [selection, setSelection] = createSignal("none");

  return (
    <>
      <DataGrid
        model={grid}
        caption="QA records"
        onSortChange={(next) => setSort(next ? `${next.column} ${next.direction}` : "none")}
        onPageChange={setPage}
        onSelectionChange={(ids) => setSelection([...ids].sort().join(",") || "none")}
      />
      <h2>Grid sort: {sort()}</h2>
      <h2>Grid page: {page()}</h2>
      <h2>Grid selection: {selection()}</h2>
      <h2>Grid first filtered row: {grid.filteredRows()[0]?.name ?? "none"}</h2>
    </>
  );
}

function ImmersiveLandingFixture() {
  const [navigation, setNavigation] = createSignal("none");
  return (
    <>
      <ImmersiveLanding
        id="immersive-landing-fixture"
        pages={["first", "second"]}
        initialPage="first"
        transitionDuration={0}
        onNavigate={(from, to) => setNavigation(`${from} to ${to}`)}
      >
        <ImmersiveLanding.Page id="first"><h2>First landing page</h2></ImmersiveLanding.Page>
        <ImmersiveLanding.Page id="second"><h2>Second landing page</h2></ImmersiveLanding.Page>
      </ImmersiveLanding>
      <h2>Landing navigation: {navigation()}</h2>
    </>
  );
}

function PWAInstallPromptFixture() {
  const [outcome, setOutcome] = createSignal("none");
  setTimeout(() => {
    const installEvent = new Event("beforeinstallprompt", { cancelable: true });
    Object.defineProperties(installEvent, {
      prompt: { value: () => undefined },
      userChoice: { value: Promise.resolve({ outcome: "accepted", platform: "web" }) },
    });
    window.dispatchEvent(installEvent);
  }, 0);

  return (
    <>
      <PWAInstallPrompt
        id="qa-pwa-install-a"
        storageKey="qa-pwa-install"
        texts={{ installButton: "Install A", notNowButton: "Not now A", closeLabel: "Close A" }}
        onInstall={() => setOutcome("installed")}
      />
      <PWAInstallPrompt
        id="qa-pwa-install-b"
        storageKey="qa-pwa-later"
        texts={{ installButton: "Install B", notNowButton: "Not now B", closeLabel: "Close B" }}
        onDismiss={() => setOutcome("later")}
      />
      <PWAInstallPrompt
        id="qa-pwa-install-c"
        storageKey="qa-pwa-close"
        texts={{ installButton: "Install C", notNowButton: "Not now C", closeLabel: "Close C" }}
        onDismiss={() => setOutcome("closed")}
      />
      <h2>PWA outcome: {outcome()}</h2>
    </>
  );
}

function FirefoxPWABannerFixture() {
  const [outcome, setOutcome] = createSignal("none");
  const userAgentDescriptor = Object.getOwnPropertyDescriptor(navigator, "userAgent");
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: "Mozilla/5.0 Firefox/130.0",
  });
  const originalOpen = globalThis.open;
  globalThis.open = (() => null) as typeof globalThis.open;
  onCleanup(() => {
    if (userAgentDescriptor) Object.defineProperty(navigator, "userAgent", userAgentDescriptor);
    globalThis.open = originalOpen;
  });

  return (
    <>
      <FirefoxPWABanner
        id="qa-firefox-pwa-a"
        storageKey="qa-firefox-install"
        showDelayMs={0}
        texts={{ installButton: "Install extension A", dismissButton: "Maybe later A", closeLabel: "Close Firefox A" }}
        onInstall={() => setOutcome("installed")}
      />
      <FirefoxPWABanner
        id="qa-firefox-pwa-b"
        storageKey="qa-firefox-later"
        showDelayMs={0}
        texts={{ installButton: "Install extension B", dismissButton: "Maybe later B", closeLabel: "Close Firefox B" }}
        onDismiss={() => setOutcome("later")}
      />
      <FirefoxPWABanner
        id="qa-firefox-pwa-c"
        storageKey="qa-firefox-close"
        showDelayMs={0}
        texts={{ installButton: "Install extension C", dismissButton: "Maybe later C", closeLabel: "Close Firefox C" }}
        onDismiss={() => setOutcome("closed")}
      />
      <h2>Firefox PWA outcome: {outcome()}</h2>
    </>
  );
}

function TableFixture() {
  const [direction, setDirection] = createSignal<"ascending" | "descending">("descending");
  return (
    <>
      <Table>
        <Table.Content
          sortDescriptor={{ column: "name", direction: direction() }}
          onSortChange={(next) => setDirection(next.direction)}
        >
          <Table.Header><Table.Row><Table.Column id="name" allowsSorting>Name fixture</Table.Column></Table.Row></Table.Header>
          <Table.Body><Table.Row><Table.Cell>Alpha</Table.Cell></Table.Row></Table.Body>
        </Table.Content>
      </Table>
      <h2>Table sort: {direction()}</h2>
    </>
  );
}

function ToastFixture() {
  const [outcome, setOutcome] = createSignal("none");
  toast.clear();
  return (
    <>
      <Button
        onClick={() => toast("Fixture toast", {
          timeout: 0,
          actionProps: {
            children: "Undo fixture",
            onClick: () => setOutcome("action"),
          },
          onClose: () => setOutcome("closed"),
        })}
      >
        Show fixture toast
      </Button>
      <Toast.Provider />
      <h2>Toast outcome: {outcome()}</h2>
    </>
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
  const [sent, setSent] = createSignal("none");
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
            id="qa-live-chat-panel"
            onClose={() => setComplete(true)}
            onSendMessage={async ({ message }: { message: string }) => {
              setSent(message);
              return { messageId: "qa-message", timestamp: Date.now() };
            }}
          />
          <h2>LiveChat sent: {sent()}</h2>
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

function PanelToggleFixture(props: { spec: ComponentSpec; under?: unknown }) {
  const [expanded, setExpanded] = createSignal(true);
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
        <div
          style={{
            position: "relative",
            width: "16rem",
            height: "8rem",
            "margin-right": "1rem",
          }}
        >
          <Dynamic
            component={Component()}
            id="qa-panel-toggle"
            expanded={expanded()}
            side="right"
            aria-label={expanded() ? "Hide details" : "Show details"}
            aria-controls="qa-panel"
            onClick={() => setExpanded((value) => !value)}
          />
          <aside id="qa-panel">Details panel</aside>
          <CompletedAction component="PanelToggle" complete={!expanded()} />
        </div>
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
        <>
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
          {/*
            Names the value the *consumer* received, not the one the renderer
            holds.

            `-accepts-input` asserts `ValueChanges` on the control, which reads
            the editor's own buffer: it passes whether or not the component
            ever told anyone. A field whose `onInput` never reaches its caller
            is exactly as broken as one that refuses keystrokes, and it looked
            identical to this suite.
          */}
          <h2>Field value: {value()}</h2>
        </>
      )}
    </Show>
  );
}

function SliderFixture(props: { spec: ComponentSpec; under?: unknown }) {
  const [value, setValue] = createSignal(50);
  const [committed, setCommitted] = createSignal<number>();
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
            value={value()}
            onChange={setValue}
            onChangeEnd={setCommitted}
            label={props.spec.subject}
          />
          <Show when={committed() !== undefined}>
            <h2>Slider committed: {committed()}</h2>
          </Show>
        </>
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
/*
 * The panel, with a store of its own and one endpoint.
 *
 * The endpoint is named "API URL" because that is the label the checks name,
 * and the callback result sits in `children`, which the panel renders inside
 * the region the switch reveals. So the `-acts` outcome is the defect every
 * hand-written copy of this page had: the switch flips, and the revealed region
 * either paints or it does not.
 */
function ConnectionSettingsFixture() {
  /*
   * What the panel told its caller, named so a check can read it.
   *
   * A save that returns early -- refused by validation, or throwing inside
   * `apply` -- is indistinguishable from a save that worked on nothing, and
   * both leave the committed value where it was. Reporting the outcome is the
   * difference between "Save is dead" and "Save refused this address".
   */
  const [outcome, setOutcome] = createSignal("none");
  /*
   * What `onApply` was handed, and what storage already held when it ran.
   *
   * Two promises `apply` makes that nothing could see: the callback receives
   * the settings that were just saved, and they are persisted *before* it runs
   * -- which is what a callback that reloads or navigates depends on. The
   * fixture had no `onApply` at all, so both were unasserted, and the ordering
   * one was in fact broken: persistence happened in a deferred effect a
   * microtask after the reconnect.
   */
  const [reconnect, setReconnect] = createSignal("none");
  const storageKey = "qa-connection-settings";
  const store = createConnectionSettings({
    storageKey,
    appPublicId: "QaAppPublicId123",
    endpoints: [{ name: "api", fallback: "wss://api.example.com" }],
    onApply: ({ urls }) => {
      let persisted = "nothing";
      try {
        const raw = localStorage.getItem(storageKey);
        const parsed: unknown = raw ? JSON.parse(raw) : undefined;
        const stored =
          parsed && typeof parsed === "object" && "urls" in parsed
            ? (parsed as { urls?: Record<string, string> }).urls?.api
            : undefined;
        persisted = stored ?? "nothing";
      } catch {
        persisted = "unreadable";
      }
      setReconnect(`${urls.api} over ${persisted}`);
    },
  });

  return (
    <>
    <ConnectionSettings
      id="connection-settings-fixture"
      store={store}
      endpoints={[{ name: "api", label: "API URL" }]}
      labels={{
        useCustom: "Use a custom backend",
        appPublicId: "Application ID",
        save: "Save",
        reset: "Reset",
      }}
      showAppPublicId
      validateAppPublicId={(id) =>
        /^[0-9A-Za-z]{16}$/.test(id)
          ? undefined
          : "Application ID must be 16 letters or numbers"
      }
      onSaved={() => setOutcome("saved")}
      onResetDone={() => setOutcome("reset")}
      onSaveFailed={(error: unknown) =>
        setOutcome(
          `failed ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    >
      {/*
        Names the committed value, so the checks can tell "typed" from "saved".
        It reads the store, not the draft, which is the distinction the whole
        `settings` kind exists to assert.
      */}
      <h2>Committed: {store.urls.api}</h2>
      <h2>Committed app: {store.state.appPublicId}</h2>
      <h2>Save outcome: {outcome()}</h2>
      <h2>Reconnected: {reconnect()}</h2>
    </ConnectionSettings>
    <h2>Panel outcome: {outcome()}</h2>
    </>
  );
}

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
 * A toggle, and a heading that only its callback can produce.
 *
 * `selected` in the tree is not evidence the component did anything: the
 * renderer flips a checkbox's own state on a click, so a controlled toggle
 * whose `onChange` never fires still reports the new value. `switch-toggles`
 * passed on exactly that while Switch was inert under Blitz, which dispatches
 * the click but not the change.
 *
 * This names the state the fixture holds, so the `-reports` check fails unless
 * the callback ran.
 */
function ToggleFixtureWithReport(props: {
  spec: ComponentSpec;
  under?: unknown;
}) {
  const [on, setOn] = createSignal(false);
  const [pressed, setPressed] = createSignal(false);
  return (
    <>
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
            /*
             * One handler, deliberately. The older fixture bound `onChange` and
             * `onInput` both, to cover components that disagreed about which
             * they took. Once the toggles actually invoked their callback that
             * became two flips per click, which nets to no change at all and
             * reads exactly like a dead component.
             */
            onChange={() => {
              setPressed(true);
              setOn((previous) => !previous);
            }}
            aria-label={props.spec.component}
          />
        )}
      </Show>
      {/*
        Latched, not a live reading of `on`. Checks in a group share one host, so
        `-toggles` has already pressed this control by the time `-reports` runs;
        a node naming the current state would only be right when the number of
        presses happened to be odd. This appears on the first callback and stays.
      */}
      <Show when={pressed()}>
        <h2>Callback ran</h2>
      </Show>
    </>
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
  const [selected, setSelected] = createSignal("none");
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
            items={[
              { title: "Home", icon: <Icon src="icon-[lucide--house]" />, onClick: () => setSelected("Home") },
              { title: "Search", icon: <Icon src="icon-[lucide--search]" />, onClick: () => setSelected("Search") },
              { title: "Settings", icon: <Icon src="icon-[lucide--settings]" />, onClick: () => setSelected("Settings") },
            ]}
            showMobile={false}
          />
          <h2>Dock selected: {selected()}</h2>
        </>
      )}
    </Show>
  );
}

function FormFixture() {
  const [saved, setSaved] = createSignal("Not saved");
  let submissions = 0;
  const form = createForm<{ quantity: string }, { quantity: number }>({
    defaultValues: { quantity: "" },
    schema: {
      "~standard": {
        version: 1,
        vendor: "qa-quantity",
        validate(value) {
          const quantity = Number((value as { quantity: string }).quantity);
          return Number.isInteger(quantity) && quantity > 0
            ? { value: { quantity } }
            : { issues: [{ message: "Enter a positive quantity", path: ["quantity"] }] };
        },
      },
    },
    onSubmit(value) {
      setSaved(`Saved ${value.quantity}:${typeof value.quantity}:${++submissions}`);
    },
  });
  return (
    <Form form={form}>
      <Input aria-label="Quantity" value={form.values().quantity}
        onInput={(event) => form.setFieldValue("quantity", event.currentTarget.value)} />
      <Show when={form.getFieldMeta("quantity").isTouched && form.getFieldMeta("quantity").errors[0]}>
        {(message) => <p role="alert">{message}</p>}
      </Show>
      <Button type="submit">Save quantity</Button>
      <p role="status">{saved()}</p>
    </Form>
  );
}

function CalendarFixture() {
  const [value, setValue] = createSignal(new Date(2025, 5, 15));
  return (
    <>
      <Calendar id="qa-calendar" value={value()} onChange={setValue} />
      <p role="status">Selected {value().getFullYear()}-{String(value().getMonth() + 1).padStart(2, "0")}-{String(value().getDate()).padStart(2, "0")}</p>
    </>
  );
}

const isoDate = (value?: Date) => value
  ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
  : "none";

function ButtonGroupFixture() {
  const [selected, setSelected] = createSignal("none");
  return <><ButtonGroup><Button onClick={() => setSelected("first")}>First grouped button</Button><Button onClick={() => setSelected("second")}>Second grouped button</Button></ButtonGroup><h2>ButtonGroup selected: {selected()}</h2></>;
}

function CheckboxGroupFixture() {
  const [value, setValue] = createSignal<string[]>([]);
  return (
    <>
      <CheckboxGroup value={value()} onChange={setValue}>
        <Checkbox value="first">First choice</Checkbox>
        <Checkbox value="second">Second choice</Checkbox>
      </CheckboxGroup>
      <h2>CheckboxGroup value: {value().join(",") || "none"}</h2>
    </>
  );
}

function ColorAreaFixture() {
  const [value, setValue] = createSignal<ColorAreaValue>({ h: 240, s: 50, v: 50 });
  const [changed, setChanged] = createSignal(false);
  return (
    <>
      <ColorArea aria-label="Color area" value={value()} onChange={(next) => { setValue(next); setChanged(true); }} />
      <Show when={changed()}><h2>ColorArea changed</h2></Show>
    </>
  );
}

function ColorFieldFixture() {
  const [value, setValue] = createSignal("#FFFFFF");
  return (
    <>
      <ColorField aria-label="Color value" value={value()} onChange={setValue} />
      <h2>ColorField value: {value()}</h2>
    </>
  );
}

function ColorPickerFixture() {
  const [value, setValue] = createSignal("#6366F1");
  const [changed, setChanged] = createSignal(false);
  return (
    <>
      <ColorPicker value={value()} onChange={(next) => { setValue(next); setChanged(true); }}>
        <ColorPicker.Area aria-label="Color area" />
        <ColorPicker.Slider aria-label="Hue" />
        <ColorPicker.Field aria-label="Color value" />
      </ColorPicker>
      <Show when={changed()}><h2>ColorPicker changed</h2></Show>
      <h2>ColorPicker value: {value()}</h2>
    </>
  );
}

function ColorSliderFixture() {
  const [value, setValue] = createSignal(180);
  const [changed, setChanged] = createSignal(false);
  return (
    <>
      <ColorSlider aria-label="Hue" value={value()} onChange={(next) => { setValue(next); setChanged(true); }} />
      <Show when={changed()}><h2>ColorSlider changed</h2></Show>
    </>
  );
}

function ColorSwatchPickerFixture() {
  const [value, setValue] = createSignal("#ff0000");
  return (
    <>
      <ColorSwatchPicker value={value()} onChange={setValue}>
        <ColorSwatch color="#ff0000" colorName="Red swatch" />
        <ColorSwatch color="#0000ff" colorName="Blue swatch" />
      </ColorSwatchPicker>
      <h2>ColorSwatchPicker value: {value()}</h2>
    </>
  );
}

function ComboBoxFixture() {
  const [selected, setSelected] = createSignal<string | null>(null);
  return (
    <>
      <ComboBox
        items={[{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }]}
        selectedKey={selected()}
        onSelectionChange={setSelected}
      >
        <ComboBox.InputGroup>
          <ComboBox.Input aria-label="Fixture combo box" />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover><ComboBox.List /></ComboBox.Popover>
      </ComboBox>
      <h2>ComboBox value: {selected() ?? "none"}</h2>
    </>
  );
}

function DateFieldFixture() {
  const [value, setValue] = createSignal("");
  return (
    <>
      <DateField value={value()} onChange={setValue}>
        <DateField.Group><DateField.Input aria-label="Date value" /></DateField.Group>
      </DateField>
      <h2>DateField value: {value()}</h2>
    </>
  );
}

function DatePickerFixture() {
  const [value, setValue] = createSignal(new Date(2025, 5, 15));
  return (
    <>
      <DatePicker value={value()} onChange={setValue} />
      <h2>DatePicker value: {isoDate(value())}</h2>
    </>
  );
}

function DateRangePickerFixture() {
  const [value, setValue] = createSignal<DateRangeValue>({ start: new Date(2025, 5, 15), end: new Date(2025, 5, 17) });
  return (
    <>
      <DateRangePicker value={value()} onChange={setValue} />
      <h2>DateRangePicker start: {isoDate(value().start)}</h2>
      <h2>DateRangePicker end: {isoDate(value().end)}</h2>
    </>
  );
}

function FlexGridFixture() {
  return (
    <FlexGrid
      rows={["One", "Two", "Three"]}
      pageSize={2}
      autoLoad={false}
      more={({ reveal }) => <button type="button" onClick={reveal}>Load more rows</button>}
    >
      {(row) => <h2>Row {row}</h2>}
    </FlexGrid>
  );
}

function InputOTPFixture() {
  const [value, setValue] = createSignal("");
  return (
    <>
      <InputOTP aria-label="Verification code" value={value()} onChange={setValue} />
      <h2>InputOTP value: {value()}</h2>
    </>
  );
}

function JoinFixture() {
  const [selected, setSelected] = createSignal("none");
  return <><Join><Button onClick={() => setSelected("first")}>First joined button</Button><Button onClick={() => setSelected("second")}>Second joined button</Button></Join><h2>Join selected: {selected()}</h2></>;
}

function KbdFixture() {
  return <Kbd><Kbd.Abbr keyValue="command" /><Kbd.Content>K</Kbd.Content></Kbd>;
}

function MenuFixture() {
  const [selected, setSelected] = createSignal(new Set<string>(["a"]));
  return (
    <>
      <Menu selectionMode="single" selectedKeys={selected()} onSelectionChange={setSelected}>
        <Menu.Item id="a" textValue="Alpha action">Alpha action</Menu.Item>
        <Menu.Item id="b" textValue="Beta action">Beta action</Menu.Item>
      </Menu>
      <h2>Menu value: {[...selected()].join(",") || "none"}</h2>
    </>
  );
}

function MeterFixture() { return <Meter label="Storage used" value={60} />; }
function NoiseBackgroundFixture() { return <NoiseBackground><span>Noise background content</span></NoiseBackground>; }
function RadialProgressFixture() { return <RadialProgress aria-label="Upload progress" value={60} />; }

function RadioGroupFixture() {
  const [value, setValue] = createSignal("first");
  return (
    <>
      <RadioGroup value={value()} onChange={setValue} label="Fixture radios">
        <Radio value="first">First radio</Radio>
        <Radio value="second">Second radio</Radio>
      </RadioGroup>
      <h2>RadioGroup value: {value()}</h2>
    </>
  );
}

function RangeCalendarFixture() {
  const [value, setValue] = createSignal<RangeCalendarValue>({ start: new Date(2025, 5, 15), end: new Date(2025, 5, 17) });
  return (
    <>
      <RangeCalendar value={value()} onChange={setValue} />
      <h2>RangeCalendar start: {isoDate(value().start)}</h2>
      <h2>RangeCalendar end: {isoDate(value().end)}</h2>
    </>
  );
}

function SizePickerFixture() {
  const [value, setValue] = createSignal("M");
  return <><SizePicker storagePrefix="qa-size" onSizeChange={setValue} /><h2>SizePicker value: {value()}</h2></>;
}

function TimeFieldFixture() {
  const [value, setValue] = createSignal("");
  return (
    <>
      <TimeField value={value()} onChange={setValue}>
        <TimeField.Group><TimeField.Input aria-label="Time value" /></TimeField.Group>
      </TimeField>
      <h2>TimeField value: {value()}</h2>
    </>
  );
}

function ToolbarFixture() {
  const [focused, setFocused] = createSignal("none");
  return (
    <>
      <Toolbar>
        <Button onFocus={() => setFocused("first")}>First tool</Button>
        <Button onFocus={() => setFocused("second")}>Second tool</Button>
      </Toolbar>
      <h2>Toolbar focus: {focused()}</h2>
    </>
  );
}

function VideoPreviewFixture() {
  const stream = () => ({ getTracks: () => [] } as unknown as MediaStream);
  return <VideoPreview stream={stream} aria-label="Video preview" class="w-48 h-32" />;
}

/** Ids with a hand-written fixture; everything else mounts generically. */
const FIXTURES: Record<
  string,
  // `under` is the resolved component, which the harness passes to whichever
  // fixture it selected. The hand-written fixtures that import their component
  // statically ignore it; `ToggleFixtureWithReport` is generic over three
  // components and needs it.
  (props: { spec: ComponentSpec; under?: unknown }) => JSX.Element
> = {
  accordion: AccordionFixture,
  address: AddressFixture,
  alert: AlertFixture,
  "auth-footer-links": AuthFooterLinksFixture,
  "auth-powered-by": AuthPoweredByFixture,
  "auth-submit-button": ActionFixture,
  button: ActionFixture,
  "button-group": ButtonGroupFixture,
  breadcrumb: BreadcrumbFixture,
  card: CardFixture,
  calendar: CalendarFixture,
  checkbox: ToggleFixtureWithReport,
  "checkbox-group": CheckboxGroupFixture,
  chip: ChipFixture,
  "close-button": CloseButtonFixture,
  "color-area": ColorAreaFixture,
  "color-field": ColorFieldFixture,
  "color-picker": ColorPickerFixture,
  "color-slider": ColorSliderFixture,
  "color-swatch": ColorSwatchFixture,
  "color-swatch-picker": ColorSwatchPickerFixture,
  "color-wheel": ColorWheelFixture,
  "color-wheel-flower": ColorWheelFlowerFixture,
  collapsible: CollapsibleFixture,
  "connection-settings": ConnectionSettingsFixture,
  "cookie-consent": CookieConsentFixture,
  "data-grid": DataGridFixture,
  "complex-color-wheel": ComplexColorWheelFixture,
  "combo-box": ComboBoxFixture,
  composer: ComposerFixture,
  dialog: DialogFixture,
  "date-field": DateFieldFixture,
  "date-picker": DatePickerFixture,
  "date-range-picker": DateRangePickerFixture,
  dock: DockFixture,
  drawer: DrawerFixture,
  dropdown: DropdownFixture,
  form: FormFixture,
  "flex-grid": FlexGridFixture,
  "firefox-pwa-banner": FirefoxPWABannerFixture,
  "inline-edit": InlineEditFixture,
  input: FieldFixture,
  "immersive-landing": ImmersiveLandingFixture,
  "input-otp": InputOTPFixture,
  join: JoinFixture,
  kbd: KbdFixture,
  "language-switcher": LanguageSwitcherFixture,
  link: ActionFixture,
  "list-box": ListBoxFixture,
  "live-chat-bubble": LiveChatBubbleFixture,
  "live-chat-panel": LiveChatPanelFixture,
  menu: MenuFixture,
  meter: MeterFixture,
  "noise-background": NoiseBackgroundFixture,
  pagination: PaginationFixture,
  "panel-toggle": PanelToggleFixture,
  "password-field": PasswordFieldFixture,
  popover: PopoverFixture,
  "pwa-install-prompt": PWAInstallPromptFixture,
  "radial-progress": RadialProgressFixture,
  radio: ToggleFixtureWithReport,
  "radio-group": RadioGroupFixture,
  "range-calendar": RangeCalendarFixture,
  select: SelectFixture,
  "size-picker": SizePickerFixture,
  slider: SliderFixture,
  switch: ToggleFixtureWithReport,
  table: TableFixture,
  tabs: TabsFixture,
  textarea: FieldFixture,
  "time-field": TimeFieldFixture,
  toolbar: ToolbarFixture,
  "theme-color-picker": ThemeColorPickerFixture,
  tooltip: TooltipFixture,
  toast: ToastFixture,
  "video-preview": VideoPreviewFixture,
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
