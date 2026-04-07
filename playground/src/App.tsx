import { For } from "solid-js";
import { Badge, Button, Dropdown, Tabs } from "@pathscale/ui";

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

export default function App() {
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
      </div>
    </main>
  );
}
