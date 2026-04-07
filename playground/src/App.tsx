import { For, createSignal } from "solid-js";
import { Badge, Button, Checkbox, Dropdown, Input, Radio, RadioGroup, SliderField, Tabs, Toggle } from "@pathscale/ui";

const BADGE_COLORS = [
  "default",
  "accent",
  "success",
  "warning",
  "danger",
] as const;

const BADGE_VARIANTS = ["primary", "secondary", "soft"] as const;
const BADGE_SIZES = ["sm", "md", "lg"] as const;
const BADGE_PLACEMENTS = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;

const TAB_ITEMS = [
  { key: "overview", label: "Overview", content: "Overview content" },
  { key: "activity", label: "Activity", content: "Recent activity" },
  { key: "settings", label: "Settings", content: "Settings content" },
  { key: "disabled", label: "Disabled", content: "Disabled content", disabled: true },
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
const TOGGLE_COLORS = ["default", "accent", "success", "warning", "danger"] as const;
const TOGGLE_SIZES = ["sm", "md", "lg"] as const;

export default function App() {
  const [selectedFramework, setSelectedFramework] = createSignal("solid");
  const [checkedTerms, setCheckedTerms] = createSignal(false);
  const [toggleOn, setToggleOn] = createSignal(false);
  const [sliderVal, setSliderVal] = createSignal(30);
  const [sliderSm, setSliderSm] = createSignal(50);
  const [sliderLg, setSliderLg] = createSignal(70);

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
            <h2 class="text-sm font-semibold">Tabs</h2>
            <p class="text-xs opacity-70">Primary and secondary variants, horizontal + vertical.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Primary</h3>
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
                  {(item) => <Tabs.Panel id={item.key}>{item.content}</Tabs.Panel>}
                </For>
              </Tabs.Root>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Secondary</h3>
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
                  {(item) => <Tabs.Panel id={item.key}>{item.content}</Tabs.Panel>}
                </For>
              </Tabs.Root>
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Primary Vertical</h3>
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
                  {(item) => <Tabs.Panel id={item.key}>{item.content}</Tabs.Panel>}
                </For>
              </Tabs.Root>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Secondary Vertical</h3>
              <Tabs.Root defaultSelectedKey="members" orientation="vertical" variant="secondary">
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
                  {(item) => <Tabs.Panel id={item.key}>{item.content}</Tabs.Panel>}
                </For>
              </Tabs.Root>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Dropdown</h2>
            <p class="text-xs opacity-70">Open/close, outside click, keyboard nav, and disabled items.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Start Align</h3>
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
              <h3 class="text-xs font-semibold uppercase opacity-70">End Align</h3>
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
            <h2 class="text-sm font-semibold">Button</h2>
            <p class="text-xs opacity-70">HeroUI-style variant API matrix with size/state coverage.</p>
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
            <p class="text-xs opacity-70">HeroUI-style baseline with size, focus, disabled, and invalid states.</p>
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
            <h3 class="text-xs font-semibold uppercase opacity-70">With Slots</h3>
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
            <h2 class="text-sm font-semibold">Radio + RadioGroup</h2>
            <p class="text-xs opacity-70">HeroUI-style baseline for selection controls.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Uncontrolled Vertical</h3>
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
              <h3 class="text-xs font-semibold uppercase opacity-70">Controlled Horizontal</h3>
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
              <h3 class="text-xs font-semibold uppercase opacity-70">Invalid State</h3>
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
              <h3 class="text-xs font-semibold uppercase opacity-70">Disabled Group</h3>
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
            <p class="text-xs opacity-70">HeroUI-style baseline with checked, indeterminate, and disabled states.</p>
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
              <h3 class="text-xs font-semibold uppercase opacity-70">Controlled + Variant</h3>
              <div class="flex flex-col gap-3">
                <Checkbox
                  checked={checkedTerms()}
                  onChange={(event) => setCheckedTerms(event.currentTarget.checked)}
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
            <p class="text-xs opacity-70">HeroUI-style switch with color, size, and state coverage.</p>
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
              <h3 class="text-xs font-semibold uppercase opacity-70">Controlled + Description</h3>
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
            <p class="text-xs opacity-70">HeroUI-style range slider with sizes and states.</p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Default</h3>
              <SliderField
                label="Volume"
                value={sliderVal()}
                onChange={setSliderVal}
              />
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Custom Format</h3>
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
      </div>
    </main>
  );
}
