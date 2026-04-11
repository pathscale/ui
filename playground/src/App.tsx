import { For, createSignal } from "solid-js";
import {
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Chip,
  EmptyState,
  Loading,
  Progress,
  Skeleton,
  Checkbox,
  ColorArea,
  ColorField,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ColorPicker,
  Drawer,
  FloatingDock,
  Dropdown,
  Input,
  Pagination,
  Radio,
  RadioGroup,
  Select,
  SliderField,
  Tabs,
  Toggle,
  Tooltip,
  ThemeColorPicker,
} from "@pathscale/ui";
import { TableExamples } from "./examples/TableExamples";
import { TableHooksExample } from "./examples/TableHooksExample";
import { TableVirtualizedExample } from "./examples/TableVirtualizedExample";
import { StreamingComposableExample } from "./examples/StreamingComposableExample";

const BADGE_COLORS = [
  "default",
  "accent",
  "success",
  "warning",
  "danger",
] as const;

const BADGE_VARIANTS = ["primary", "secondary", "soft"] as const;
const BADGE_SIZES = ["sm", "md", "lg"] as const;
const BADGE_PLACEMENTS = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
] as const;
const CHIP_VARIANTS = ["solid", "flat", "bordered"] as const;
const CHIP_SIZES = ["sm", "md", "lg"] as const;
const CHIP_COLORS = ["default", "primary", "accent", "success", "warning", "danger"] as const;

const TAB_ITEMS = [
  { key: "overview", label: "Overview", content: "Overview content" },
  { key: "activity", label: "Activity", content: "Recent activity" },
  { key: "settings", label: "Settings", content: "Settings content" },
  {
    key: "disabled",
    label: "Disabled",
    content: "Disabled content",
    disabled: true,
  },
] as const;

const VERTICAL_TAB_ITEMS = [
  { key: "details", label: "Details", content: "Details panel" },
  { key: "members", label: "Members", content: "Members panel" },
  { key: "billing", label: "Billing", content: "Billing panel" },
] as const;

const DROPDOWN_ITEMS = [
  { key: "profile", label: "Profile" },
  { key: "billing", label: "Billing" },
  { key: "team", label: "Team settings" },
  { key: "disabled", label: "Disabled option", disabled: true },
] as const;

const BUTTON_VARIANTS = [
  "primary",
  "secondary",
  "tertiary",
  "outline",
  "ghost",
  "danger",
  "danger-soft",
] as const;

const BUTTON_SIZES = ["sm", "md", "lg"] as const;
const INPUT_SIZES = ["sm", "md", "lg"] as const;
const TOGGLE_COLORS = [
  "default",
  "accent",
  "success",
  "warning",
  "danger",
] as const;
const TOGGLE_SIZES = ["sm", "md", "lg"] as const;
const TOOLTIP_PLACEMENTS = ["top", "bottom", "left", "right"] as const;
const ALERT_STATUSES = [
  "default",
  "accent",
  "success",
  "warning",
  "danger",
] as const;

export default function App() {
  const [selectedFramework, setSelectedFramework] = createSignal("solid");
  const [checkedTerms, setCheckedTerms] = createSignal(false);
  const [colorAreaValue, setColorAreaValue] = createSignal({ h: 210, s: 75, v: 80 });
  const [colorFieldValue, setColorFieldValue] = createSignal("#3B82F6");
  const [colorPickerValue, setColorPickerValue] = createSignal("#3B82F6");
  const [themeHue, setThemeHue] = createSignal<number | null>(null);
  const [themeSaturation, setThemeSaturation] = createSignal(100);
  const [colorSliderHue, setColorSliderHue] = createSignal(220);
  const [colorSliderAlpha, setColorSliderAlpha] = createSignal(0.75);
  const [selectedSwatch, setSelectedSwatch] = createSignal("#3B82F6");
  const [selectedSwatchPicker, setSelectedSwatchPicker] = createSignal("#3B82F6");
  const [toggleOn, setToggleOn] = createSignal(false);
  const [sliderVal, setSliderVal] = createSignal(30);
  const [sliderSm, setSliderSm] = createSignal(50);
  const [sliderLg, setSliderLg] = createSignal(70);
  const [basicPage, setBasicPage] = createSignal(1);
  const [largePage, setLargePage] = createSignal(8);
  const [controlledPage, setControlledPage] = createSignal(3);
  const [controlledState, setControlledState] = createSignal<string | null>("california");
  const [selectedRegions, setSelectedRegions] = createSignal<string[]>([
    "north-america",
    "europe",
  ]);
  const [showRemovableChip, setShowRemovableChip] = createSignal(true);

  return (
    <main class="min-h-screen bg-base-100 text-base-content p-8">
      <div class="mx-auto max-w-5xl space-y-8">
        <header class="space-y-2">
          <h1 class="text-2xl font-semibold">Badge Playground</h1>
          <p class="text-sm opacity-70">Minimal test surface for Badge only.</p>
        </header>

        <section class="space-y-3 rounded-xl border border-base-300 bg-base-200 p-4">
          <h2 class="text-sm font-semibold">Colors</h2>
          <div class="flex flex-wrap gap-6">
            <For each={BADGE_COLORS}>
              {(color) => (
                <div class="flex flex-col items-center gap-2">
                  <Badge.Anchor>
                    <div class="h-14 w-14 rounded-xl border border-base-300 bg-base-100" />
                    <Badge color={color} size="sm">
                      5
                    </Badge>
                  </Badge.Anchor>
                  <span class="text-xs opacity-70">{color}</span>
                </div>
              )}
            </For>
          </div>
        </section>

        <section class="space-y-3 rounded-xl border border-base-300 bg-base-200 p-4">
          <h2 class="text-sm font-semibold">Variants</h2>
          <div class="flex flex-wrap gap-6">
            <For each={BADGE_VARIANTS}>
              {(variant) => (
                <div class="flex flex-col items-center gap-2">
                  <Badge.Anchor>
                    <div class="h-14 w-14 rounded-xl border border-base-300 bg-base-100" />
                    <Badge color="accent" variant={variant} size="sm">
                      5
                    </Badge>
                  </Badge.Anchor>
                  <span class="text-xs opacity-70">{variant}</span>
                </div>
              )}
            </For>
          </div>
        </section>

        <section class="space-y-3 rounded-xl border border-base-300 bg-base-200 p-4">
          <h2 class="text-sm font-semibold">Sizes</h2>
          <div class="flex flex-wrap items-center gap-6">
            <For each={BADGE_SIZES}>
              {(size) => (
                <div class="flex flex-col items-center gap-2">
                  <Badge.Anchor>
                    <div class="h-14 w-14 rounded-xl border border-base-300 bg-base-100" />
                    <Badge color="accent" size={size}>
                      5
                    </Badge>
                  </Badge.Anchor>
                  <span class="text-xs opacity-70">{size}</span>
                </div>
              )}
            </For>
          </div>
        </section>

        <section class="space-y-3 rounded-xl border border-base-300 bg-base-200 p-4">
          <h2 class="text-sm font-semibold">Placements</h2>
          <div class="flex flex-wrap gap-8">
            <For each={BADGE_PLACEMENTS}>
              {(placement) => (
                <div class="flex flex-col items-center gap-2">
                  <Badge.Anchor>
                    <div class="h-16 w-16 rounded-xl border border-base-300 bg-base-100" />
                    <Badge color="accent" size="sm" placement={placement} />
                  </Badge.Anchor>
                  <span class="text-xs opacity-70">{placement}</span>
                </div>
              )}
            </For>
          </div>
        </section>

        <section class="space-y-3 rounded-xl border border-base-300 bg-base-200 p-4">
          <h2 class="text-sm font-semibold">Dot Mode (Empty Content)</h2>
          <div class="flex flex-wrap gap-6">
            <For each={BADGE_SIZES}>
              {(size) => (
                <Badge.Anchor>
                  <div class="h-16 w-16 rounded-xl border border-base-300 bg-base-100" />
                  <Badge color="success" size={size} placement="bottom-right" />
                </Badge.Anchor>
              )}
            </For>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Chip</h2>
            <p class="text-xs opacity-70">
              Solid, flat, bordered variants with size, color, icon, and removable behavior.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Variants + Colors</h3>
            <For each={CHIP_VARIANTS}>
              {(variant) => (
                <div class="flex flex-wrap items-center gap-3">
                  <For each={CHIP_COLORS}>
                    {(color) => (
                      <Chip variant={variant} color={color}>
                        {variant}/{color}
                      </Chip>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Sizes</h3>
            <div class="flex flex-wrap items-center gap-3">
              <For each={CHIP_SIZES}>
                {(size) => (
                  <Chip size={size} variant="flat" color="accent">
                    {size}
                  </Chip>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Start/End Content + Remove</h3>
            <div class="flex flex-wrap items-center gap-3">
              <Chip
                variant="flat"
                color="primary"
                startContent={<span class="h-2 w-2 rounded-full bg-current opacity-70" />}
              >
                Live stream
              </Chip>
              <Chip
                variant="bordered"
                color="success"
                endContent={<span class="text-[10px] font-semibold uppercase">OK</span>}
              >
                Connection
              </Chip>
              {showRemovableChip() ? (
                <Chip
                  variant="solid"
                  color="danger"
                  onRemove={() => setShowRemovableChip(false)}
                >
                  Remove me
                </Chip>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRemovableChip(true)}
                >
                  Reset removable chip
                </Button>
              )}
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Tabs</h2>
            <p class="text-xs opacity-70">
              Primary and secondary variants, horizontal + vertical.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                Primary
              </h3>
              <Tabs.Root defaultSelectedKey="overview">
                <Tabs.ListContainer>
                  <Tabs.List aria-label="Primary tabs">
                    <For each={TAB_ITEMS}>
                      {(item) => (
                        <Tabs.Tab id={item.key} isDisabled={item.disabled}>
                          <span>{item.label}</span>
                          <Tabs.Separator />
                        </Tabs.Tab>
                      )}
                    </For>
                  </Tabs.List>
                </Tabs.ListContainer>
                <For each={TAB_ITEMS}>
                  {(item) => (
                    <Tabs.Panel id={item.key}>{item.content}</Tabs.Panel>
                  )}
                </For>
              </Tabs.Root>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                Secondary
              </h3>
              <Tabs.Root defaultSelectedKey="activity" variant="secondary">
                <Tabs.ListContainer>
                  <Tabs.List aria-label="Secondary tabs">
                    <For each={TAB_ITEMS}>
                      {(item) => (
                        <Tabs.Tab id={item.key} isDisabled={item.disabled}>
                          <span>{item.label}</span>
                        </Tabs.Tab>
                      )}
                    </For>
                  </Tabs.List>
                </Tabs.ListContainer>
                <For each={TAB_ITEMS}>
                  {(item) => (
                    <Tabs.Panel id={item.key}>{item.content}</Tabs.Panel>
                  )}
                </For>
              </Tabs.Root>
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                Primary Vertical
              </h3>
              <Tabs.Root defaultSelectedKey="details" orientation="vertical">
                <Tabs.ListContainer>
                  <Tabs.List aria-label="Vertical tabs">
                    <For each={VERTICAL_TAB_ITEMS}>
                      {(item) => (
                        <Tabs.Tab id={item.key}>
                          <span>{item.label}</span>
                          <Tabs.Separator />
                        </Tabs.Tab>
                      )}
                    </For>
                  </Tabs.List>
                </Tabs.ListContainer>
                <For each={VERTICAL_TAB_ITEMS}>
                  {(item) => (
                    <Tabs.Panel id={item.key}>{item.content}</Tabs.Panel>
                  )}
                </For>
              </Tabs.Root>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                Secondary Vertical
              </h3>
              <Tabs.Root
                defaultSelectedKey="members"
                orientation="vertical"
                variant="secondary"
              >
                <Tabs.ListContainer>
                  <Tabs.List aria-label="Secondary vertical tabs">
                    <For each={VERTICAL_TAB_ITEMS}>
                      {(item) => (
                        <Tabs.Tab id={item.key}>
                          <span>{item.label}</span>
                        </Tabs.Tab>
                      )}
                    </For>
                  </Tabs.List>
                </Tabs.ListContainer>
                <For each={VERTICAL_TAB_ITEMS}>
                  {(item) => (
                    <Tabs.Panel id={item.key}>{item.content}</Tabs.Panel>
                  )}
                </For>
              </Tabs.Root>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Dropdown</h2>
            <p class="text-xs opacity-70">
              Open/close, outside click, keyboard nav, and disabled items.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                Start Align
              </h3>
              <Dropdown.Root>
                <Dropdown.Trigger>Actions</Dropdown.Trigger>
                <Dropdown.Menu align="start">
                  <Dropdown.Group>
                    <For each={DROPDOWN_ITEMS}>
                      {(item) => (
                        <Dropdown.Item disabled={item.disabled}>
                          {item.label}
                        </Dropdown.Item>
                      )}
                    </For>
                  </Dropdown.Group>
                  <Dropdown.Separator />
                  <Dropdown.Item class="text-error">Delete</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Root>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                End Align
              </h3>
              <Dropdown.Root class="w-full">
                <Dropdown.Trigger class="w-full justify-between">
                  Options
                </Dropdown.Trigger>
                <Dropdown.Menu align="end">
                  <Dropdown.Item>Rename</Dropdown.Item>
                  <Dropdown.Item>Duplicate</Dropdown.Item>
                  <Dropdown.Item>Archive</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Root>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Select</h2>
            <p class="text-xs opacity-70">
              HeroUI-style compound select with controlled, multiple, and disabled states.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Basic</h3>
              <Select placeholder="Select a state">
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <Select.Listbox>
                    <Select.Option value="florida" textValue="Florida">
                      Florida
                    </Select.Option>
                    <Select.Option value="california" textValue="California">
                      California
                    </Select.Option>
                    <Select.Option value="texas" textValue="Texas">
                      Texas
                    </Select.Option>
                    <Select.Option value="washington" textValue="Washington">
                      Washington
                    </Select.Option>
                  </Select.Listbox>
                </Select.Popover>
              </Select>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Controlled</h3>
              <Select
                value={controlledState()}
                onChange={(value) => setControlledState(typeof value === "string" ? value : null)}
                fullWidth
                placeholder="Select a state"
              >
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <Select.Listbox>
                    <Select.Option value="california" textValue="California">
                      California
                    </Select.Option>
                    <Select.Option value="nevada" textValue="Nevada">
                      Nevada
                    </Select.Option>
                    <Select.Option value="new-york" textValue="New York">
                      New York
                    </Select.Option>
                  </Select.Listbox>
                </Select.Popover>
              </Select>
              <p class="text-xs opacity-70">Selected: {controlledState() ?? "none"}</p>
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Multiple</h3>
              <Select
                selectionMode="multiple"
                value={selectedRegions()}
                onChange={(value) =>
                  setSelectedRegions(Array.isArray(value) ? value : value ? [value] : [])
                }
                placeholder="Select regions"
                fullWidth
              >
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <Select.Listbox>
                    <Select.Option value="north-america" textValue="North America">
                      North America
                    </Select.Option>
                    <Select.Option value="europe" textValue="Europe">
                      Europe
                    </Select.Option>
                    <Select.Option value="asia" textValue="Asia">
                      Asia
                    </Select.Option>
                    <Select.Option value="latam" textValue="Latin America">
                      Latin America
                    </Select.Option>
                  </Select.Listbox>
                </Select.Popover>
              </Select>
              <p class="text-xs opacity-70">Selected: {selectedRegions().join(", ")}</p>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Disabled</h3>
              <Select
                value="california"
                isDisabled
                variant="secondary"
                placeholder="Select a state"
              >
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <Select.Listbox>
                    <Select.Option value="california" textValue="California">
                      California
                    </Select.Option>
                    <Select.Option value="oregon" textValue="Oregon">
                      Oregon
                    </Select.Option>
                  </Select.Listbox>
                </Select.Popover>
              </Select>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Button</h2>
            <p class="text-xs opacity-70">
              HeroUI-style variant API matrix with size/state coverage.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Variants</h3>
            <div class="flex flex-wrap gap-3">
              <For each={BUTTON_VARIANTS}>
                {(variant) => <Button variant={variant}>{variant}</Button>}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Sizes</h3>
            <div class="flex flex-wrap items-center gap-3">
              <For each={BUTTON_SIZES}>
                {(size) => (
                  <Button size={size} variant="secondary">
                    {size}
                  </Button>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">States</h3>
            <div class="flex flex-wrap gap-3">
              <Button variant="primary" isDisabled>
                Disabled
              </Button>
              <Button variant="primary" isPending>
                Loading
              </Button>
              <Button variant="ghost" isIconOnly aria-label="Icon only">
                +
              </Button>
              <Button variant="outline" fullWidth class="max-w-xs">
                Full Width
              </Button>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Input</h2>
            <p class="text-xs opacity-70">
              HeroUI-style baseline with size, focus, disabled, and invalid
              states.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Sizes</h3>
            <div class="grid gap-3 md:grid-cols-3">
              <For each={INPUT_SIZES}>
                {(size) => (
                  <Input
                    size={size}
                    label={`Size ${size.toUpperCase()}`}
                    placeholder={`Input ${size}`}
                    helperText="Helper text"
                    fullWidth
                  />
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">States</h3>
            <div class="grid gap-3 md:grid-cols-2">
              <Input
                label="Default"
                placeholder="Type here"
                helperText="This is a helper message"
                fullWidth
              />
              <Input
                label="Focused (autofocus)"
                placeholder="Focused input"
                autofocus
                fullWidth
              />
              <Input
                label="Disabled"
                placeholder="Disabled input"
                disabled
                helperText="Disabled state"
                fullWidth
              />
              <Input
                label="Invalid"
                placeholder="Invalid input"
                isInvalid
                errorMessage="Please enter a valid value"
                fullWidth
              />
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">
              With Slots
            </h3>
            <div class="grid gap-3 md:grid-cols-2">
              <Input
                label="Start Content"
                placeholder="Search..."
                startContent={<span aria-hidden="true">S</span>}
                fullWidth
              />
              <Input
                label="End Content"
                placeholder="Amount"
                endContent={<span aria-hidden="true">USD</span>}
                fullWidth
              />
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Pagination</h2>
            <p class="text-xs opacity-70">
              HeroUI-style pagination with previous/next, active state, and ellipsis.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Basic</h3>
            <Pagination page={basicPage()} total={6} onChange={setBasicPage} />
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Large Set (Ellipsis)</h3>
            <Pagination page={largePage()} total={24} onChange={setLargePage} />
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Controlled</h3>
            <div class="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => setControlledPage(1)}>
                First
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setControlledPage(10)}>
                Last
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setControlledPage((prev) => Math.min(10, prev + 1))}>
                +1
              </Button>
            </div>
            <Pagination page={controlledPage()} total={10} onChange={setControlledPage} />
            <p class="text-xs opacity-70">Controlled page value: {controlledPage()}</p>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Radio + RadioGroup</h2>
            <p class="text-xs opacity-70">
              HeroUI-style baseline for selection controls.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                Uncontrolled Vertical
              </h3>
              <RadioGroup
                defaultValue="starter"
                label="Plan"
                description="Pick one option."
              >
                <Radio value="starter">Starter</Radio>
                <Radio value="pro">Pro</Radio>
                <Radio value="enterprise">Enterprise</Radio>
              </RadioGroup>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                Controlled Horizontal
              </h3>
              <RadioGroup
                value={selectedFramework()}
                onChange={setSelectedFramework}
                orientation="horizontal"
                variant="secondary"
                label="Framework"
                description={`Selected: ${selectedFramework()}`}
              >
                <Radio value="solid">Solid</Radio>
                <Radio value="react">React</Radio>
                <Radio value="vue" disabled>
                  Vue (disabled)
                </Radio>
              </RadioGroup>
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                Invalid State
              </h3>
              <RadioGroup
                isInvalid
                label="Environment"
                errorMessage="Select at least one environment."
              >
                <Radio value="dev" isInvalid>
                  Development
                </Radio>
                <Radio value="staging" isInvalid>
                  Staging
                </Radio>
              </RadioGroup>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                Disabled Group
              </h3>
              <RadioGroup
                isDisabled
                defaultValue="email"
                label="Notification Channel"
                description="This group is disabled."
              >
                <Radio value="email">Email</Radio>
                <Radio value="sms">SMS</Radio>
              </RadioGroup>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Checkbox</h2>
            <p class="text-xs opacity-70">
              HeroUI-style baseline with checked, indeterminate, and disabled
              states.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">States</h3>
              <div class="flex flex-col gap-3">
                <Checkbox>Unchecked</Checkbox>
                <Checkbox defaultChecked>Checked</Checkbox>
                <Checkbox isIndeterminate>Indeterminate</Checkbox>
                <Checkbox isDisabled defaultChecked>
                  Disabled checked
                </Checkbox>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                Controlled + Variant
              </h3>
              <div class="flex flex-col gap-3">
                <Checkbox
                  checked={checkedTerms()}
                  onChange={(event) =>
                    setCheckedTerms(event.currentTarget.checked)
                  }
                >
                  Accept terms ({checkedTerms() ? "on" : "off"})
                </Checkbox>
                <Checkbox variant="secondary">Secondary variant</Checkbox>
                <Checkbox isInvalid defaultChecked>
                  Invalid checked
                </Checkbox>
                <Checkbox description="Description text aligns control to the top.">
                  With description
                </Checkbox>
              </div>
            </div>
          </div>
        </section>
        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Toggle</h2>
            <p class="text-xs opacity-70">
              HeroUI-style switch with color, size, and state coverage.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Colors</h3>
              <div class="flex flex-col gap-3">
                <For each={TOGGLE_COLORS}>
                  {(color) => (
                    <Toggle color={color} defaultChecked>
                      {color}
                    </Toggle>
                  )}
                </For>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Sizes</h3>
              <div class="flex flex-col gap-3">
                <For each={TOGGLE_SIZES}>
                  {(size) => (
                    <Toggle size={size} defaultChecked color="accent">
                      {size}
                    </Toggle>
                  )}
                </For>
              </div>
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">States</h3>
              <div class="flex flex-col gap-3">
                <Toggle>Unchecked</Toggle>
                <Toggle defaultChecked>Checked</Toggle>
                <Toggle isDisabled>Disabled off</Toggle>
                <Toggle isDisabled defaultChecked>
                  Disabled on
                </Toggle>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                Controlled + Description
              </h3>
              <div class="flex flex-col gap-3">
                <Toggle
                  checked={toggleOn()}
                  onChange={(event) => setToggleOn(event.currentTarget.checked)}
                >
                  Notifications ({toggleOn() ? "on" : "off"})
                </Toggle>
                <Toggle
                  description="We'll send you updates about new features."
                  defaultChecked
                  color="success"
                >
                  Email updates
                </Toggle>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Slider</h2>
            <p class="text-xs opacity-70">
              HeroUI-style range slider with sizes and states.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                Default
              </h3>
              <SliderField
                label="Volume"
                value={sliderVal()}
                onChange={setSliderVal}
              />
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">
                Custom Format
              </h3>
              <SliderField
                label="Price"
                value={sliderVal()}
                onChange={setSliderVal}
                min={0}
                max={1000}
                step={10}
                formatValue={(v) => `$${v}`}
              />
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-3">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Small</h3>
              <SliderField
                label="Brightness"
                value={sliderSm()}
                onChange={setSliderSm}
                size="sm"
              />
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Medium</h3>
              <SliderField
                label="Contrast"
                value={sliderVal()}
                onChange={setSliderVal}
                size="md"
              />
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Large</h3>
              <SliderField
                label="Saturation"
                value={sliderLg()}
                onChange={setSliderLg}
                size="lg"
              />
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Disabled</h3>
            <SliderField
              label="Locked"
              value={60}
              onChange={() => {}}
              disabled
            />
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Tooltip</h2>
            <p class="text-xs opacity-70">
              HeroUI-style compound tooltip with placement, arrow, and
              controlled state.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">
              Placements
            </h3>
            <div class="flex flex-wrap items-center justify-center gap-12 py-8">
              <For each={TOOLTIP_PLACEMENTS}>
                {(placement) => (
                  <Tooltip placement={placement}>
                    <Tooltip.Trigger>
                      <Button variant="secondary">{placement}</Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      <Tooltip.Arrow />
                      Tooltip on {placement}
                    </Tooltip.Content>
                  </Tooltip>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">
              Without Arrow
            </h3>
            <div class="flex flex-wrap items-center gap-6 py-4">
              <Tooltip placement="top">
                <Tooltip.Trigger>
                  <Button variant="outline">No arrow</Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Simple tooltip text</Tooltip.Content>
              </Tooltip>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">
              Controlled
            </h3>
            <div class="flex flex-wrap items-center gap-6 py-4">
              <Tooltip placement="right" isOpen>
                <Tooltip.Trigger>
                  <Button variant="primary">Always open</Button>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <Tooltip.Arrow />
                  Controlled tooltip (always visible)
                </Tooltip.Content>
              </Tooltip>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Alert</h2>
            <p class="text-xs opacity-70">
              HeroUI-style compound alert with status variants and slots.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Statuses</h3>
            <div class="grid gap-3">
              <For each={ALERT_STATUSES}>
                {(status) => (
                  <Alert status={status}>
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>
                        {status.charAt(0).toUpperCase() + status.slice(1)} alert
                      </Alert.Title>
                      <Alert.Description>
                        This is a {status} alert with indicator, title, and
                        description.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">
              With Action
            </h3>
            <Alert status="accent">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Update available</Alert.Title>
                <Alert.Description>
                  A new version is available. Refresh to get the latest
                  features. A new version is available. Refresh to get the
                  latest features. A new version is available. Refresh to get
                  the latest features. A new version is available. Refresh to
                  get the latest features.
                </Alert.Description>
              </Alert.Content>
              <Button size="sm" variant="primary">
                Refresh
              </Button>
            </Alert>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">
              Title Only + Close
            </h3>
            <Alert status="success">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Profile updated successfully</Alert.Title>
              </Alert.Content>
              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                aria-label="Close"
                class="opacity-70 hover:opacity-100"
              >
                ✕
              </Button>
            </Alert>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Drawer</h2>
            <p class="text-xs opacity-70">
              HeroUI-style compound drawer with placements and backdrop variants.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">
              Placements
            </h3>
            <div class="flex flex-wrap gap-3">
              <For each={["bottom", "top", "left", "right"] as const}>
                {(placement) => (
                  <Drawer>
                    <Drawer.Trigger>
                      <Button variant="secondary">{placement}</Button>
                    </Drawer.Trigger>
                    <Drawer.Backdrop>
                      <Drawer.Content placement={placement}>
                        <Drawer.Dialog>
                          <Drawer.CloseTrigger />
                          {placement === "bottom" && <Drawer.Handle />}
                          <Drawer.Header>
                            <Drawer.Heading>
                              {placement.charAt(0).toUpperCase() + placement.slice(1)} Drawer
                            </Drawer.Heading>
                          </Drawer.Header>
                          <Drawer.Body>
                            <p>This drawer slides in from the {placement} edge.</p>
                          </Drawer.Body>
                          <Drawer.Footer>
                            <Drawer.Close>
                              <Button size="sm" variant="secondary">
                                Cancel
                              </Button>
                            </Drawer.Close>
                            <Drawer.Close>
                              <Button size="sm" variant="primary">
                                Done
                              </Button>
                            </Drawer.Close>
                          </Drawer.Footer>
                          {placement === "top" && <Drawer.Handle />}
                        </Drawer.Dialog>
                      </Drawer.Content>
                    </Drawer.Backdrop>
                  </Drawer>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">
              Backdrop Variants
            </h3>
            <div class="flex flex-wrap gap-3">
              <For each={["opaque", "blur", "transparent"] as const}>
                {(variant) => (
                  <Drawer>
                    <Drawer.Trigger>
                      <Button variant="outline">{variant}</Button>
                    </Drawer.Trigger>
                    <Drawer.Backdrop variant={variant}>
                      <Drawer.Content>
                        <Drawer.Dialog>
                          <Drawer.Handle />
                          <Drawer.CloseTrigger />
                          <Drawer.Header>
                            <Drawer.Heading>
                              Backdrop: {variant}
                            </Drawer.Heading>
                          </Drawer.Header>
                          <Drawer.Body>
                            <p>This drawer uses the {variant} backdrop variant.</p>
                          </Drawer.Body>
                          <Drawer.Footer>
                            <Drawer.Close>
                              <Button size="sm" variant="primary">
                                Close
                              </Button>
                            </Drawer.Close>
                          </Drawer.Footer>
                        </Drawer.Dialog>
                      </Drawer.Content>
                    </Drawer.Backdrop>
                  </Drawer>
                )}
              </For>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Avatar</h2>
            <p class="text-xs opacity-70">
              HeroUI-style compound avatar with image, fallback, sizes, and colors.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Sizes</h3>
            <div class="flex items-center gap-4">
              <For each={["sm", "md", "lg"] as const}>
                {(size) => (
                  <Avatar size={size}>
                    <Avatar.Fallback>{size.toUpperCase()}</Avatar.Fallback>
                  </Avatar>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Colors</h3>
            <div class="flex items-center gap-4">
              <For each={["default", "accent", "success", "warning", "danger"] as const}>
                {(color) => (
                  <Avatar color={color}>
                    <Avatar.Fallback>{color.charAt(0).toUpperCase()}</Avatar.Fallback>
                  </Avatar>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Soft Variant</h3>
            <div class="flex items-center gap-4">
              <For each={["accent", "success", "warning", "danger"] as const}>
                {(color) => (
                  <Avatar color={color} variant="soft">
                    <Avatar.Fallback>{color.charAt(0).toUpperCase()}</Avatar.Fallback>
                  </Avatar>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">With Image</h3>
            <div class="flex items-center gap-4">
              <Avatar>
                <Avatar.Image src="https://i.pravatar.cc/150?u=a" alt="User A" />
                <Avatar.Fallback>A</Avatar.Fallback>
              </Avatar>
              <Avatar>
                <Avatar.Image src="https://i.pravatar.cc/150?u=b" alt="User B" />
                <Avatar.Fallback>B</Avatar.Fallback>
              </Avatar>
              <Avatar>
                <Avatar.Image src="https://invalid-url.test/x.jpg" alt="Broken" />
                <Avatar.Fallback>?</Avatar.Fallback>
              </Avatar>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Group</h3>
            <div class="flex items-center -space-x-2">
              <Avatar class="ring-2 ring-base-100">
                <Avatar.Image src="https://i.pravatar.cc/150?u=1" alt="User 1" />
                <Avatar.Fallback>1</Avatar.Fallback>
              </Avatar>
              <Avatar class="ring-2 ring-base-100">
                <Avatar.Image src="https://i.pravatar.cc/150?u=2" alt="User 2" />
                <Avatar.Fallback>2</Avatar.Fallback>
              </Avatar>
              <Avatar class="ring-2 ring-base-100">
                <Avatar.Image src="https://i.pravatar.cc/150?u=3" alt="User 3" />
                <Avatar.Fallback>3</Avatar.Fallback>
              </Avatar>
              <Avatar class="ring-2 ring-base-100">
                <Avatar.Fallback>+5</Avatar.Fallback>
              </Avatar>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Breadcrumbs</h2>
            <p class="text-xs opacity-70">
              HeroUI-style compound breadcrumbs with separator and current page.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Default</h3>
            <Breadcrumbs>
              <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
              <Breadcrumbs.Item href="#">Products</Breadcrumbs.Item>
              <Breadcrumbs.Item href="#">Category</Breadcrumbs.Item>
              <Breadcrumbs.Item isCurrent>Current Page</Breadcrumbs.Item>
            </Breadcrumbs>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">
              Custom Separator
            </h3>
            <Breadcrumbs separator={<span>/</span>}>
              <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
              <Breadcrumbs.Item href="#">Docs</Breadcrumbs.Item>
              <Breadcrumbs.Item isCurrent>API</Breadcrumbs.Item>
            </Breadcrumbs>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Progress</h2>
            <p class="text-xs opacity-70">
              HeroUI-style compound progress bar with sizes, colors, and indeterminate.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Default</h3>
            <Progress value={60} label="Loading" size="md" color="accent">
              <Progress.Output />
              <Progress.Track>
                <Progress.Fill />
              </Progress.Track>
            </Progress>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Sizes</h3>
            <div class="grid gap-4">
              <For each={["sm", "md", "lg"] as const}>
                {(size) => (
                  <Progress value={45} label={size} size={size} color="accent">
                    <Progress.Output />
                    <Progress.Track>
                      <Progress.Fill />
                    </Progress.Track>
                  </Progress>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Colors</h3>
            <div class="grid gap-4">
              <For each={["default", "accent", "success", "warning", "danger"] as const}>
                {(color) => (
                  <Progress value={70} label={color} color={color}>
                    <Progress.Output />
                    <Progress.Track>
                      <Progress.Fill />
                    </Progress.Track>
                  </Progress>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">
              Indeterminate
            </h3>
            <Progress isIndeterminate label="Processing" color="accent">
              <Progress.Track>
                <Progress.Fill />
              </Progress.Track>
            </Progress>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Skeleton</h2>
            <p class="text-xs opacity-70">
              HeroUI-style skeleton with shimmer, pulse, and none animations.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Shimmer (default)</h3>
            <div class="flex items-center gap-4">
              <Skeleton class="h-12 w-12 rounded-full" />
              <div class="flex flex-col gap-2">
                <Skeleton class="h-4 w-40 rounded" />
                <Skeleton class="h-3 w-28 rounded" />
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Pulse</h3>
            <div class="flex items-center gap-4">
              <Skeleton animationType="pulse" class="h-12 w-12 rounded-full" />
              <div class="flex flex-col gap-2">
                <Skeleton animationType="pulse" class="h-4 w-40 rounded" />
                <Skeleton animationType="pulse" class="h-3 w-28 rounded" />
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Card Skeleton</h3>
            <div class="w-64 space-y-3 rounded-xl border border-base-300 bg-base-100 p-4">
              <Skeleton class="h-32 w-full rounded-lg" />
              <Skeleton class="h-4 w-3/4 rounded" />
              <Skeleton class="h-3 w-1/2 rounded" />
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Loading / Spinner</h2>
            <p class="text-xs opacity-70">
              HeroUI-style SVG spinner with sizes, colors, and legacy CSS variants.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Sizes</h3>
            <div class="flex items-center gap-4">
              <For each={["xs", "sm", "md", "lg", "xl"] as const}>
                {(size) => <Loading size={size} color="accent" />}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Colors</h3>
            <div class="flex items-center gap-4">
              <For each={["current", "accent", "success", "warning", "danger"] as const}>
                {(color) => <Loading size="lg" color={color} />}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Variants</h3>
            <div class="flex items-center gap-6">
              <For each={["spinner", "dots", "ring", "ball", "bars", "infinity"] as const}>
                {(variant) => (
                  <div class="flex flex-col items-center gap-2">
                    <Loading size="lg" variant={variant} color="accent" />
                    <span class="text-xs opacity-70">{variant}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </section>
        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Floating Dock</h2>
            <p class="text-xs opacity-70">
              macOS-style dock with spring magnification, x-nudge, and expanding background.
            </p>
          </div>

          <div class="space-y-2">
            <h3 class="text-xs font-semibold uppercase opacity-70">Functional Buttons</h3>
            <div class="flex items-end justify-center py-8">
              <FloatingDock
                items={[
                  { title: "Microphone", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>, onClick: () => alert("Mic toggled") },
                  { title: "Camera", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/></svg>, onClick: () => alert("Camera toggled") },
                  { title: "Screen Share", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>, onClick: () => alert("Screen share") },
                  { title: "Chat", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>, onClick: () => alert("Chat opened") },
                  { title: "Settings", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>, onClick: () => alert("Settings") },
                  { title: "Leave", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>, onClick: () => alert("Leave call") },
                ]}
              />
            </div>
          </div>

          <div class="space-y-2">
            <h3 class="text-xs font-semibold uppercase opacity-70">No Magnification</h3>
            <div class="flex items-end justify-center py-8">
              <FloatingDock
                items={[
                  { title: "Bold", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>, onClick: () => {} },
                  { title: "Italic", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>, onClick: () => {} },
                  { title: "Underline", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>, onClick: () => {} },
                  { title: "Link", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>, onClick: () => {} },
                ]}
                magnify={false}
                baseSize={36}
                iconSize={16}
                gap={8}
              />
            </div>
          </div>

          <div class="space-y-2">
            <h3 class="text-xs font-semibold uppercase opacity-70">
              Mobile: Dock Mode (resize to see)
            </h3>
            <p class="text-xs opacity-50">
              mobileMode="dock" shows the full bar on mobile instead of a burger menu.
            </p>
            <div class="flex items-end justify-center py-8">
              <FloatingDock
                items={[
                  { title: "Mic", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>, onClick: () => {} },
                  { title: "Cam", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/></svg>, onClick: () => {} },
                  { title: "End", icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>, onClick: () => {} },
                ]}
                mobileMode="dock"
                baseSize={36}
              />
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Empty State</h2>
            <p class="text-xs opacity-70">
              Compound empty state for lists, tables, and search results.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Simple</h3>
            <div class="rounded-lg border border-base-300 bg-base-100">
              <EmptyState>
                <EmptyState.Icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                </EmptyState.Icon>
                <EmptyState.Title>No documents</EmptyState.Title>
                <EmptyState.Description>
                  Get started by creating a new document.
                </EmptyState.Description>
                <EmptyState.Actions>
                  <Button size="sm" variant="primary">New Document</Button>
                </EmptyState.Actions>
              </EmptyState>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Search Results</h3>
            <div class="rounded-lg border border-base-300 bg-base-100">
              <EmptyState>
                <EmptyState.Icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </EmptyState.Icon>
                <EmptyState.Title>No results found</EmptyState.Title>
                <EmptyState.Description>
                  Try adjusting your search or filter to find what you're looking for.
                </EmptyState.Description>
                <EmptyState.Actions>
                  <Button size="sm" variant="secondary">Clear filters</Button>
                </EmptyState.Actions>
              </EmptyState>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">ColorArea</h2>
            <p class="text-xs opacity-70">HSV saturation/brightness area with pointer and keyboard interaction.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Controlled</h3>
              <ColorArea value={colorAreaValue()} onChange={setColorAreaValue} />
              <p class="text-xs opacity-70">
                H {Math.round(colorAreaValue().h)} S {Math.round(colorAreaValue().s)} V {Math.round(colorAreaValue().v)}
              </p>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Disabled</h3>
              <ColorArea value={{ h: 40, s: 70, v: 85 }} isDisabled />
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">ColorField</h2>
            <p class="text-xs opacity-70">Text input for color editing with parsing, formatting, and validation.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Controlled (HEX)</h3>
              <ColorField
                value={colorFieldValue()}
                onChange={setColorFieldValue}
                format="hex"
                placeholder="#RRGGBB"
              />
              <p class="text-xs opacity-70">Current: {colorFieldValue()}</p>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Formats + Disabled</h3>
              <div class="flex flex-col gap-3">
                <ColorField defaultValue="rgb(59, 130, 246)" format="rgb" />
                <ColorField defaultValue="hsl(217, 91%, 60%)" format="hsl" />
                <ColorField value="#9CA3AF" isDisabled format="hex" />
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">ColorSwatch</h2>
            <p class="text-xs opacity-70">Single selectable swatch with keyboard and disabled states.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Selectable</h3>
              <div class="flex flex-wrap items-center gap-3" role="listbox" aria-label="Color swatches">
                <ColorSwatch
                  color="#3B82F6"
                  isSelected={selectedSwatch() === "#3B82F6"}
                  onSelect={setSelectedSwatch}
                />
                <ColorSwatch
                  color="#EF4444"
                  isSelected={selectedSwatch() === "#EF4444"}
                  onSelect={setSelectedSwatch}
                />
                <ColorSwatch
                  color="#10B981"
                  isSelected={selectedSwatch() === "#10B981"}
                  onSelect={setSelectedSwatch}
                />
                <ColorSwatch
                  color="rgba(59, 130, 246, 0.4)"
                  shape="square"
                  isSelected={selectedSwatch() === "rgba(59, 130, 246, 0.4)"}
                  onSelect={setSelectedSwatch}
                />
              </div>
              <p class="text-xs opacity-70">Selected: {selectedSwatch()}</p>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Sizes + Disabled</h3>
              <div class="flex items-center gap-3">
                <ColorSwatch color="#8B5CF6" size="xs" />
                <ColorSwatch color="#8B5CF6" size="sm" />
                <ColorSwatch color="#8B5CF6" size="md" />
                <ColorSwatch color="#8B5CF6" size="lg" />
                <ColorSwatch color="#8B5CF6" size="xl" />
                <ColorSwatch color="#9CA3AF" isDisabled />
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">ColorSwatchPicker</h2>
            <p class="text-xs opacity-70">Single-select palette built from ColorSwatch primitives.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Controlled</h3>
              <ColorSwatchPicker value={selectedSwatchPicker()} onChange={setSelectedSwatchPicker}>
                <ColorSwatch color="#3B82F6" />
                <ColorSwatch color="#EF4444" />
                <ColorSwatch color="#10B981" />
                <ColorSwatch color="#F59E0B" />
                <ColorSwatch color="#8B5CF6" />
              </ColorSwatchPicker>
              <p class="text-xs opacity-70">Selected: {selectedSwatchPicker()}</p>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Uncontrolled + Disabled</h3>
              <div class="flex flex-col gap-3">
                <ColorSwatchPicker defaultValue="#10B981">
                  <ColorSwatch color="#3B82F6" shape="square" />
                  <ColorSwatch color="#10B981" shape="square" />
                  <ColorSwatch color="#F59E0B" shape="square" />
                </ColorSwatchPicker>

                <ColorSwatchPicker isDisabled defaultValue="#9CA3AF">
                  <ColorSwatch color="#9CA3AF" />
                  <ColorSwatch color="#6B7280" />
                  <ColorSwatch color="#4B5563" />
                </ColorSwatchPicker>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">ColorSlider</h2>
            <p class="text-xs opacity-70">Single-axis slider for hue and alpha control.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Hue</h3>
              <ColorSlider type="hue" value={colorSliderHue()} onChange={setColorSliderHue} />
              <p class="text-xs opacity-70">Hue: {Math.round(colorSliderHue())}°</p>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Alpha</h3>
              <ColorSlider
                type="alpha"
                value={colorSliderAlpha()}
                onChange={setColorSliderAlpha}
                style={{ "--color-slider-alpha-color": "rgb(59 130 246)" }}
              />
              <p class="text-xs opacity-70">Alpha: {(colorSliderAlpha() * 100).toFixed(0)}%</p>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">ColorPicker</h2>
            <p class="text-xs opacity-70">Composed color selection with synced area and field.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Controlled</h3>
              <ColorPicker value={colorPickerValue()} onChange={setColorPickerValue} />
              <p class="text-xs opacity-70">Current: {colorPickerValue()}</p>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Custom Composition</h3>
              <ColorPicker defaultValue="#EF4444">
                <ColorPicker.Area />
                <ColorPicker.Slider type="hue" />
                <ColorPicker.Slider type="alpha" />
                <ColorPicker.Field format="rgb" />
              </ColorPicker>
            </div>
          </div>
        </section>
        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">ThemeColorPicker (Flower Wheel)</h2>
            <p class="text-xs opacity-70">Top-right flower wheel demo with synced hue slider + hex field.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Interactive</h3>
              <div class="flex items-center gap-3">
                <ThemeColorPicker
                  onColorChange={(hue, saturation) => {
                    setThemeHue(hue);
                    setThemeSaturation(saturation);
                  }}
                />
                <span class="text-xs opacity-70">Open the palette button to test flower selection.</span>
              </div>
            </div>

            <div class="space-y-2 rounded-lg border border-base-300 bg-base-100 p-3 text-xs">
              <p>
                Hue: {themeHue() === null ? "neutral" : `${Math.round(themeHue() ?? 0)}deg`}
              </p>
              <p>Saturation: {Math.round(themeSaturation())}%</p>
            </div>
          </div>
        </section>

        <TableExamples />
        <TableHooksExample />
        <TableVirtualizedExample />
        <StreamingComposableExample />

      </div>
    </main>
  );
}
