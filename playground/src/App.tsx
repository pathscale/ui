import { For, createSignal } from "solid-js";
import {
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Card,
  Chip,
  CheckboxGroup,
  EmptyState,
  ErrorMessage,
  FieldError,
  Fieldset,
  DateField,
  ListBox,
  Loading,
  Menu,
  NumberField,
  Progress,
  SearchField,
  Skeleton,
  Surface,
  Checkbox,
  ColorArea,
  ColorField,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ColorPicker,
  CloseButton,
  Drawer,
  FloatingDock,
  Dropdown,
  Description,
  Header,
  Input,
  Label,
  Pagination,
  Radio,
  RadioGroup,
  Select,
  Separator,
  SliderField,
  Tag,
  TagGroup,
  Tabs,
  Text,
  TextArea,
  TextField,
  TimeField,
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
const CARD_VARIANTS = ["default", "flat", "bordered", "shadow"] as const;
const SURFACE_VARIANTS = ["default", "secondary", "tertiary", "transparent"] as const;
const SEPARATOR_VARIANTS = ["default", "secondary", "tertiary"] as const;
const TEXT_SIZES = ["xs", "sm", "base", "lg", "xl"] as const;
const TEXT_VARIANTS = ["default", "muted", "success", "warning", "danger"] as const;

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

const LISTBOX_USERS = [
  { id: "bob", name: "Bob", email: "bob@heroui.com" },
  { id: "fred", name: "Fred", email: "fred@heroui.com" },
  { id: "martha", name: "Martha", email: "martha@heroui.com" },
] as const;

const LISTBOX_TOPICS = [
  { id: "design", label: "Design" },
  { id: "docs", label: "Documentation" },
  { id: "api", label: "API" },
  { id: "research", label: "Research" },
] as const;

const LISTBOX_LONG_ITEMS = Array.from({ length: 20 }, (_, index) => ({
  id: `item-${index + 1}`,
  label: `List item ${index + 1}`,
}));

export default function App() {
  const [selectedFramework, setSelectedFramework] = createSignal("solid");
  const [checkedTerms, setCheckedTerms] = createSignal(false);
  const [selectedChannels, setSelectedChannels] = createSignal<string[]>(["email", "push"]);
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
  const [cardPressCount, setCardPressCount] = createSignal(0);
  const [selectedTag, setSelectedTag] = createSignal<Set<string>>(new Set(["news"]));
  const [selectedTopics, setSelectedTopics] = createSignal<Set<string>>(
    new Set(["design", "docs"]),
  );
  const [removableTags, setRemovableTags] = createSignal<string[]>([
    "react",
    "solid",
    "svelte",
    "vue",
  ]);
  const [selectedListUser, setSelectedListUser] = createSignal<Set<string>>(new Set(["bob"]));
  const [selectedListTopics, setSelectedListTopics] = createSignal<Set<string>>(
    new Set(["design", "api"]),
  );
  const [lastListAction, setLastListAction] = createSignal<string | null>(null);
  const [selectedMenuMode, setSelectedMenuMode] = createSignal<Set<string>>(new Set(["preview"]));
  const [selectedMenuFilters, setSelectedMenuFilters] = createSignal<Set<string>>(new Set(["all"]));
  const [lastMenuAction, setLastMenuAction] = createSignal<string | null>(null);
  const [emailError, setEmailError] = createSignal<string>("Email is required.");
  const [usernameError, setUsernameError] = createSignal<string>("Username is required.");
  const [controlledTextFieldValue, setControlledTextFieldValue] = createSignal("Pathscale");
  const [controlledTextAreaValue, setControlledTextAreaValue] = createSignal(
    "Building HeroUI parity components in Solid.",
  );
  const [controlledSearchValue, setControlledSearchValue] = createSignal("analytics");
  const [controlledNumberValue, setControlledNumberValue] = createSignal<number | undefined>(3);
  const [controlledDateValue, setControlledDateValue] = createSignal("2026-04-11");
  const [controlledTimeValue, setControlledTimeValue] = createSignal("13:30");

  return (
    <main class="min-h-screen bg-base-100 text-base-content p-8">
      <div class="mx-auto max-w-5xl space-y-8">
        <header class="space-y-2">
          <h1 class="text-2xl font-semibold">Component Playground</h1>
          <p class="text-sm opacity-70">Focused migration test surfaces for HeroUI parity.</p>
        </header>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Card</h2>
            <p class="text-xs opacity-70">
              Compound API with static variants and optional hoverable/pressable interactions.
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <Card class="min-h-36">
              <p class="text-sm">Basic card content with the default surface styling.</p>
            </Card>

            <Card variant="bordered" class="min-h-36">
              <Card.Header>
                <h3 class="text-sm font-medium">Header / Body / Footer</h3>
                <p class="text-xs opacity-70">Structured slots for consistent spacing.</p>
              </Card.Header>
              <Card.Body>
                <p class="text-sm opacity-80">Use `Card.Body` for the main content block.</p>
              </Card.Body>
              <Card.Footer>
                <Button size="sm" variant="outline">
                  Secondary action
                </Button>
                <Button size="sm">Primary action</Button>
              </Card.Footer>
            </Card>
          </div>

          <div class="space-y-2">
            <h3 class="text-xs font-semibold uppercase opacity-70">Variants</h3>
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <For each={CARD_VARIANTS}>
                {(variant) => (
                  <Card variant={variant} class="min-h-28">
                    <Card.Header>
                      <h4 class="text-xs font-semibold uppercase tracking-wide">{variant}</h4>
                    </Card.Header>
                    <Card.Body>
                      <p class="text-xs opacity-75">Static map variant: `{variant}`.</p>
                    </Card.Body>
                  </Card>
                )}
              </For>
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <Card
              variant="shadow"
              isHoverable
              isPressable
              class="min-h-36 select-none"
              onClick={() => setCardPressCount((count) => count + 1)}
            >
              <Card.Header>
                <h3 class="text-sm font-medium">Interactive Card</h3>
              </Card.Header>
              <Card.Body>
                <p class="text-sm opacity-80">
                  Hover and click (or press Enter/Space while focused) to test behavior.
                </p>
              </Card.Body>
              <Card.Footer>
                <span class="text-xs opacity-70">Pressed {cardPressCount()} times</span>
              </Card.Footer>
            </Card>

            <Card variant="flat" class="min-h-36">
              <Card.Header>
                <h3 class="text-sm font-medium">Nested Content</h3>
              </Card.Header>
              <Card.Body>
                <p class="text-sm opacity-80">Cards can nest for grouped layouts.</p>
                <Card variant="bordered">
                  <Card.Body>
                    <p class="text-xs opacity-75">Nested bordered card inside `Card.Body`.</p>
                  </Card.Body>
                </Card>
              </Card.Body>
            </Card>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Surface</h2>
            <p class="text-xs opacity-70">
              HeroUI-parity surface primitive with default/secondary/tertiary/transparent variants.
            </p>
          </div>

          <Surface class="rounded-2xl border border-base-300 p-4">
            <h3 class="text-sm font-semibold">Default Surface</h3>
            <p class="text-sm opacity-80">
              Base container for grouping content with foreground/background contrast.
            </p>
          </Surface>

          <div class="grid gap-4 md:grid-cols-2">
            <For each={SURFACE_VARIANTS}>
              {(variant) => (
                <div class="space-y-2">
                  <p class="text-xs font-semibold uppercase opacity-70">{variant}</p>
                  <Surface
                    variant={variant}
                    class="flex min-h-32 flex-col gap-2 rounded-2xl border border-base-300 p-4"
                  >
                    <h4 class="text-sm font-semibold">Surface {variant}</h4>
                    <p class="text-xs opacity-75">
                      Variant `{variant}` from HeroUI surface model.
                    </p>
                  </Surface>
                </div>
              )}
            </For>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Separator</h2>
            <p class="text-xs opacity-70">
              HeroUI-style separator with orientation and variant support.
            </p>
          </div>

          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase opacity-70">Horizontal</p>
            <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
              <p class="text-sm">Profile Settings</p>
              <Separator />
              <p class="text-sm opacity-80">Team preferences and notification controls.</p>
            </div>
          </div>

          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase opacity-70">Vertical</p>
            <div class="flex h-8 items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-3">
              <span class="text-sm">Blog</span>
              <Separator orientation="vertical" />
              <span class="text-sm">Docs</span>
              <Separator orientation="vertical" />
              <span class="text-sm">Source</span>
            </div>
          </div>

          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase opacity-70">Variants</p>
            <div class="space-y-3 rounded-xl border border-base-300 bg-base-100 p-3">
              <For each={SEPARATOR_VARIANTS}>
                {(variant) => (
                  <div class="space-y-1">
                    <p class="text-xs uppercase opacity-70">{variant}</p>
                    <Separator variant={variant} />
                  </div>
                )}
              </For>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Text</h2>
            <p class="text-xs opacity-70">
              HeroUI text primitive with size and tone variants.
            </p>
          </div>

          <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
            <Text class="block">Default body copy for general content.</Text>
            <Text class="block" variant="muted">
              Muted supporting copy for secondary information.
            </Text>
          </div>

          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase opacity-70">Sizes</p>
            <div class="space-y-1 rounded-xl border border-base-300 bg-base-100 p-3">
              <For each={TEXT_SIZES}>
                {(size) => (
                  <Text size={size} class="block">
                    Size {size}: Typography scale example
                  </Text>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase opacity-70">Variants</p>
            <div class="flex flex-wrap items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-3">
              <For each={TEXT_VARIANTS}>
                {(variant) => (
                  <Text variant={variant} size="sm">
                    {variant}
                  </Text>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase opacity-70">Inline Usage</p>
            <div class="rounded-xl border border-base-300 bg-base-100 p-3">
              <p class="text-sm">
                Status: <Text variant="success">ready</Text> with{" "}
                <Text variant="warning">1 pending warning</Text> and{" "}
                <Text variant="danger">0 critical errors</Text>.
              </p>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Header</h2>
            <p class="text-xs opacity-70">
              Lightweight section header primitive with muted label styling.
            </p>
          </div>

          <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
            <Header>General</Header>
            <p class="text-sm">Basic header for a grouped content block.</p>
          </div>

          <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
            <Header class="flex items-center justify-between">
              <span>Team Members</span>
              <Button size="sm" variant="ghost">
                Invite
              </Button>
            </Header>
            <p class="text-sm opacity-80">
              Header content can include actions while keeping default spacing and typography.
            </p>
          </div>

          <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
            <Header class="space-y-0.5">
              <span class="block">Billing</span>
              <span class="block text-[11px] opacity-75">
                Last updated 2 minutes ago
              </span>
            </Header>
            <p class="text-sm opacity-80">Supports stacked title and metadata content.</p>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Label</h2>
            <p class="text-xs opacity-70">
              Semantic form label with required, disabled, and invalid states.
            </p>
          </div>

          <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
            <Label>Basic Label</Label>
            <p class="text-sm opacity-80">Default text styling for field captions.</p>
          </div>

          <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
            <Label htmlFor="label-email-demo">Email Address</Label>
            <input
              id="label-email-demo"
              type="email"
              placeholder="you@example.com"
              class="h-10 w-full rounded-xl border border-base-300 bg-base-100 px-3 text-sm text-base-content outline-none focus:border-accent"
            />
          </div>

          <div class="grid gap-3 md:grid-cols-3">
            <div class="space-y-1 rounded-xl border border-base-300 bg-base-100 p-3">
              <Label isRequired>Required</Label>
              <p class="text-xs opacity-70">Shows required indicator.</p>
            </div>
            <div class="space-y-1 rounded-xl border border-base-300 bg-base-100 p-3">
              <Label isInvalid>Invalid</Label>
              <p class="text-xs opacity-70">Uses danger text styling.</p>
            </div>
            <div class="space-y-1 rounded-xl border border-base-300 bg-base-100 p-3">
              <Label isDisabled>Disabled</Label>
              <p class="text-xs opacity-70">Disabled visual treatment.</p>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Description</h2>
            <p class="text-xs opacity-70">
              Supporting helper text primitive for form and UI context.
            </p>
          </div>

          <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
            <Description>
              Standalone description text for secondary context and guidance.
            </Description>
          </div>

          <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
            <Label htmlFor="description-email-demo">Email Address</Label>
            <input
              id="description-email-demo"
              aria-describedby="description-email-helper"
              type="email"
              placeholder="you@example.com"
              class="h-10 w-full rounded-xl border border-base-300 bg-base-100 px-3 text-sm text-base-content outline-none focus:border-accent"
            />
            <Description id="description-email-helper">
              We&apos;ll only use this to send account updates.
            </Description>
          </div>

          <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
            <Label>Project Name</Label>
            <Description>
              Use a clear, human-readable name. You can rename it later.
            </Description>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">ErrorMessage &amp; FieldError</h2>
            <p class="text-xs opacity-70">
              Error text primitives for standalone feedback and field-level validation messages.
            </p>
          </div>

          <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
            <ErrorMessage>Something went wrong while saving your profile settings.</ErrorMessage>
          </div>

          <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
            <Label htmlFor="field-error-email-demo">Email</Label>
            <input
              id="field-error-email-demo"
              type="email"
              aria-invalid={emailError() ? "true" : undefined}
              aria-describedby="field-error-email-demo-message"
              placeholder="you@example.com"
              class="h-10 w-full rounded-xl border border-base-300 bg-base-100 px-3 text-sm text-base-content outline-none focus:border-accent"
              onInput={(event) => {
                const value = event.currentTarget.value.trim();
                if (!value) {
                  setEmailError("Email is required.");
                  return;
                }
                if (!value.includes("@")) {
                  setEmailError("Please enter a valid email address.");
                  return;
                }
                setEmailError("");
              }}
            />
            <FieldError id="field-error-email-demo-message" isVisible={Boolean(emailError())}>
              {emailError()}
            </FieldError>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
              <Label htmlFor="field-error-username-demo">Username</Label>
              <input
                id="field-error-username-demo"
                type="text"
                aria-invalid={usernameError() ? "true" : undefined}
                aria-describedby="field-error-username-demo-message"
                placeholder="min 3 characters"
                class="h-10 w-full rounded-xl border border-base-300 bg-base-100 px-3 text-sm text-base-content outline-none focus:border-accent"
                onInput={(event) => {
                  const value = event.currentTarget.value.trim();
                  if (!value) {
                    setUsernameError("Username is required.");
                    return;
                  }
                  if (value.length < 3) {
                    setUsernameError("Username must be at least 3 characters.");
                    return;
                  }
                  setUsernameError("");
                }}
              />
              <FieldError id="field-error-username-demo-message" isVisible={Boolean(usernameError())}>
                {usernameError()}
              </FieldError>
            </div>

            <div class="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
              <p class="text-sm font-medium">Visibility State</p>
              <FieldError isVisible={false}>
                This message stays hidden until the visible state changes.
              </FieldError>
              <FieldError isVisible>Password must include at least one special character.</FieldError>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">TextField &amp; TextArea</h2>
            <p class="text-xs opacity-70">
              TextField wrapper with Label/Description/Error composition and TextArea variants.
            </p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <TextField class="rounded-xl border border-base-300 bg-base-100 p-3" fullWidth>
              <Label htmlFor="text-field-demo-input">Project Name</Label>
              <input
                id="text-field-demo-input"
                data-slot="input"
                value={controlledTextFieldValue()}
                onInput={(event) => setControlledTextFieldValue(event.currentTarget.value)}
                class="h-10 w-full rounded-xl border border-base-300 bg-base-100 px-3 text-sm text-base-content outline-none focus:border-accent"
                placeholder="Type a project name"
              />
              <Description>Current value: {controlledTextFieldValue()}</Description>
            </TextField>

            <TextField
              class="rounded-xl border border-base-300 bg-base-100 p-3"
              variant="secondary"
              fullWidth
            >
              <Label htmlFor="text-field-demo-area">Notes</Label>
              <TextArea
                id="text-field-demo-area"
                rows={4}
                fullWidth
                placeholder="Write implementation details..."
                value={controlledTextAreaValue()}
                onInput={(event) => setControlledTextAreaValue(event.currentTarget.value)}
              />
              <Description>Character count: {controlledTextAreaValue().length}</Description>
            </TextField>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">SearchField</h2>
            <p class="text-xs opacity-70">
              Compound field with search icon, clear trigger, and controlled value support.
            </p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <SearchField
              value={controlledSearchValue()}
              onChange={setControlledSearchValue}
              fullWidth
              class="rounded-xl border border-base-300 bg-base-100 p-3"
            >
              <Label htmlFor="search-field-controlled">Search repositories</Label>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input id="search-field-controlled" placeholder="Search..." />
                <SearchField.ClearButton />
              </SearchField.Group>
              <Description>Query: {controlledSearchValue() || "Empty"}</Description>
            </SearchField>

            <SearchField
              defaultValue="billing"
              variant="secondary"
              class="rounded-xl border border-base-300 bg-base-100 p-3"
            >
              <Label htmlFor="search-field-secondary">Secondary variant</Label>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input id="search-field-secondary" placeholder="Try 'analytics'" />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">NumberField</h2>
            <p class="text-xs opacity-70">
              Numeric input with increment/decrement actions and min/max/step constraints.
            </p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <NumberField
              value={controlledNumberValue()}
              onChange={setControlledNumberValue}
              min={0}
              max={10}
              step={0.5}
              fullWidth
              class="rounded-xl border border-base-300 bg-base-100 p-3"
            >
              <Label htmlFor="number-field-controlled">Seats</Label>
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input id="number-field-controlled" />
                <NumberField.IncrementButton />
              </NumberField.Group>
              <Description>Selected: {controlledNumberValue() ?? "Empty"}</Description>
            </NumberField>

            <NumberField
              defaultValue={5}
              min={1}
              max={20}
              step={1}
              variant="secondary"
              class="rounded-xl border border-base-300 bg-base-100 p-3"
            >
              <Label htmlFor="number-field-secondary">Retries</Label>
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input id="number-field-secondary" />
                <NumberField.IncrementButton />
              </NumberField.Group>
            </NumberField>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">DateField &amp; TimeField</h2>
            <p class="text-xs opacity-70">
              Compound date/time fields with grouped input structure and prefix/suffix slots.
            </p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <DateField
              value={controlledDateValue()}
              onChange={setControlledDateValue}
              fullWidth
              class="rounded-xl border border-base-300 bg-base-100 p-3"
            >
              <Label htmlFor="date-field-controlled">Start Date</Label>
              <DateField.Group>
                <DateField.Prefix>
                  <span class="text-xs opacity-70">Date</span>
                </DateField.Prefix>
                <DateField.Input id="date-field-controlled" />
              </DateField.Group>
              <Description>Value: {controlledDateValue() || "Empty"}</Description>
            </DateField>

            <TimeField
              value={controlledTimeValue()}
              onChange={setControlledTimeValue}
              variant="secondary"
              fullWidth
              class="rounded-xl border border-base-300 bg-base-100 p-3"
            >
              <Label htmlFor="time-field-controlled">Start Time</Label>
              <TimeField.Group>
                <TimeField.Input id="time-field-controlled" />
                <TimeField.Suffix>
                  <span class="text-xs opacity-70">24h</span>
                </TimeField.Suffix>
              </TimeField.Group>
              <Description>Value: {controlledTimeValue() || "Empty"}</Description>
            </TimeField>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Fieldset</h2>
            <p class="text-xs opacity-70">
              Group related fields with semantic legend, field group, and actions areas.
            </p>
          </div>

          <Fieldset class="rounded-xl border border-base-300 bg-base-100 p-4">
            <Fieldset.Legend>Profile Settings</Fieldset.Legend>
            <Fieldset.Group>
              <TextField fullWidth>
                <Label htmlFor="fieldset-name">Display Name</Label>
                <input
                  id="fieldset-name"
                  data-slot="input"
                  class="h-10 w-full rounded-xl border border-base-300 bg-base-100 px-3 text-sm text-base-content outline-none focus:border-accent"
                  placeholder="Pathscale Team"
                />
              </TextField>
              <TextField fullWidth>
                <Label htmlFor="fieldset-bio">Bio</Label>
                <TextArea id="fieldset-bio" rows={3} fullWidth placeholder="Tell us about your team..." />
              </TextField>
            </Fieldset.Group>
            <Fieldset.Actions>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
              <Button size="sm">Save</Button>
            </Fieldset.Actions>
          </Fieldset>
        </section>

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
            <h2 class="text-sm font-semibold">Button Group</h2>
            <p class="text-xs opacity-70">
              HeroUI-style grouped buttons with orientation, shared variants, and separators.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Default</h3>
            <ButtonGroup>
              <Button>Overview</Button>
              <Button>
                <ButtonGroup.Separator />
                Activity
              </Button>
              <Button>
                <ButtonGroup.Separator />
                Settings
              </Button>
            </ButtonGroup>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Sizes</h3>
            <div class="flex flex-wrap items-center gap-3">
              <For each={BUTTON_SIZES}>
                {(size) => (
                  <ButtonGroup size={size} variant="secondary">
                    <Button>Left</Button>
                    <Button>
                      <ButtonGroup.Separator />
                      Center
                    </Button>
                    <Button>
                      <ButtonGroup.Separator />
                      Right
                    </Button>
                  </ButtonGroup>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Variants + Disabled</h3>
            <div class="flex flex-wrap items-center gap-3">
              <ButtonGroup variant="outline">
                <Button>Month</Button>
                <Button>
                  <ButtonGroup.Separator />
                  Week
                </Button>
                <Button>
                  <ButtonGroup.Separator />
                  Day
                </Button>
              </ButtonGroup>

              <ButtonGroup variant="danger-soft" isDisabled>
                <Button>Save</Button>
                <Button>
                  <ButtonGroup.Separator />
                  Publish
                </Button>
              </ButtonGroup>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Orientation + Full Width</h3>
            <div class="grid gap-3 md:grid-cols-2">
              <div class="space-y-2">
                <p class="text-xs opacity-70">Horizontal</p>
                <ButtonGroup fullWidth variant="secondary">
                  <Button>List</Button>
                  <Button>
                    <ButtonGroup.Separator />
                    Board
                  </Button>
                  <Button>
                    <ButtonGroup.Separator />
                    Timeline
                  </Button>
                </ButtonGroup>
              </div>

              <div class="space-y-2">
                <p class="text-xs opacity-70">Vertical</p>
                <ButtonGroup orientation="vertical" class="w-48" variant="tertiary" fullWidth>
                  <Button>Account</Button>
                  <Button>
                    <ButtonGroup.Separator />
                    Security
                  </Button>
                  <Button>
                    <ButtonGroup.Separator />
                    Billing
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Close Button</h2>
            <p class="text-xs opacity-70">
              HeroUI-style close button with default icon fallback and interactive states.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Default + Disabled</h3>
            <div class="flex flex-wrap items-center gap-3">
              <CloseButton />
              <CloseButton aria-label="Dismiss panel" />
              <CloseButton isDisabled />
              <CloseButton isPending />
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Custom Icon</h3>
            <div class="flex flex-wrap items-center gap-3">
              <CloseButton aria-label="Close with custom icon">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" role="presentation">
                  <path
                    d="M4 8h8M8 4v8"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                  />
                </svg>
              </CloseButton>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Inside Header</h3>
            <div class="max-w-md rounded-xl border border-base-300 bg-base-100 p-4">
              <div class="flex items-center justify-between gap-3">
                <h4 class="text-sm font-medium">Modal Header</h4>
                <CloseButton />
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Tag + TagGroup</h2>
            <p class="text-xs opacity-70">
              HeroUI-style tags with group-driven variants, selection modes, and remove support.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Single Selection</h3>
              <TagGroup
                selectionMode="single"
                selectedKeys={selectedTag()}
                onSelectionChange={(keys) => setSelectedTag(new Set(keys))}
              >
                <TagGroup.List>
                  <Tag id="news">News</Tag>
                  <Tag id="travel">Travel</Tag>
                  <Tag id="gaming">Gaming</Tag>
                </TagGroup.List>
                <span class="text-xs opacity-70" data-slot="description">
                  Selected: {Array.from(selectedTag()).join(", ") || "None"}
                </span>
              </TagGroup>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Multiple + Surface</h3>
              <TagGroup
                selectionMode="multiple"
                selectedKeys={selectedTopics()}
                onSelectionChange={(keys) => setSelectedTopics(new Set(keys))}
                variant="surface"
                size="lg"
              >
                <TagGroup.List>
                  <Tag id="design">Design</Tag>
                  <Tag id="docs">Documentation</Tag>
                  <Tag id="api">API</Tag>
                  <Tag id="research">Research</Tag>
                </TagGroup.List>
              </TagGroup>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Removable</h3>
            <TagGroup
              selectionMode="multiple"
              onRemove={(keys) =>
                setRemovableTags((prev) => prev.filter((tag) => !keys.has(tag)))
              }
            >
              <TagGroup.List
                items={removableTags()}
                renderEmptyState={() => (
                  <span class="text-xs opacity-70" data-slot="description">
                    No tags left
                  </span>
                )}
              >
                {(item) => (
                  <Tag id={String(item)} textValue={String(item)}>
                    {String(item)}
                  </Tag>
                )}
              </TagGroup.List>
            </TagGroup>
          </div>

          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase opacity-70">Custom Remove Button</h3>
            <TagGroup selectionMode="single" onRemove={() => undefined}>
              <TagGroup.List>
                <Tag id="alpha">
                  {(state) => (
                    <>
                      Alpha
                      {state.allowsRemoving && (
                        <Tag.RemoveButton>
                          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" role="presentation">
                            <path
                              d="M4 8h8M8 4v8"
                              stroke="currentColor"
                              stroke-width="1.6"
                              stroke-linecap="round"
                            />
                          </svg>
                        </Tag.RemoveButton>
                      )}
                    </>
                  )}
                </Tag>
                <Tag id="beta">Beta</Tag>
              </TagGroup.List>
            </TagGroup>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">ListBox</h2>
            <p class="text-xs opacity-70">
              HeroUI-style ListBox with item indicators, section grouping, and keyboard selection.
            </p>
          </div>

          <div class="grid gap-6 lg:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Single Selection</h3>
              <ListBox
                selectionMode="single"
                selectedKeys={selectedListUser()}
                onSelectionChange={(keys) => setSelectedListUser(new Set(keys))}
                class="max-w-xs rounded-3xl border border-base-300 bg-base-100 p-2"
              >
                <For each={LISTBOX_USERS}>
                  {(user) => (
                    <ListBox.Item id={user.id} textValue={user.name}>
                      <div class="flex flex-col">
                        <span data-slot="label">{user.name}</span>
                        <span class="text-xs opacity-70" data-slot="description">
                          {user.email}
                        </span>
                      </div>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  )}
                </For>
              </ListBox>
              <p class="text-xs opacity-70">
                Selected: {Array.from(selectedListUser()).join(", ") || "None"}
              </p>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Multiple Selection</h3>
              <ListBox
                selectionMode="multiple"
                selectedKeys={selectedListTopics()}
                onSelectionChange={(keys) => setSelectedListTopics(new Set(keys))}
                items={LISTBOX_TOPICS}
                class="max-w-xs rounded-3xl border border-base-300 bg-base-100 p-2"
              >
                {(item) => {
                  const topic = item as (typeof LISTBOX_TOPICS)[number];
                  return (
                    <ListBox.Item id={topic.id} textValue={topic.label}>
                      <span data-slot="label">{topic.label}</span>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  );
                }}
              </ListBox>
              <p class="text-xs opacity-70">
                Selected: {Array.from(selectedListTopics()).join(", ") || "None"}
              </p>
            </div>
          </div>

          <div class="grid gap-6 lg:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Sections + Disabled Item</h3>
              <ListBox
                selectionMode="none"
                disabledKeys={["delete-file"]}
                onAction={(key) => setLastListAction(key)}
                class="max-w-xs rounded-3xl border border-base-300 bg-base-100 p-2"
              >
                <ListBox.Section title={<span class="px-2 py-1 text-xs font-semibold">Actions</span>}>
                  <ListBox.Item id="new-file" textValue="New file">
                    <div class="flex flex-col">
                      <span data-slot="label">New file</span>
                      <span class="text-xs opacity-70" data-slot="description">
                        Create a new file
                      </span>
                    </div>
                  </ListBox.Item>
                  <ListBox.Item id="edit-file" textValue="Edit file">
                    <div class="flex flex-col">
                      <span data-slot="label">Edit file</span>
                      <span class="text-xs opacity-70" data-slot="description">
                        Make changes
                      </span>
                    </div>
                  </ListBox.Item>
                </ListBox.Section>
                <Separator />
                <ListBox.Section title={<span class="px-2 py-1 text-xs font-semibold">Danger Zone</span>}>
                  <ListBox.Item id="delete-file" textValue="Delete file" variant="danger">
                    <div class="flex flex-col">
                      <span data-slot="label">Delete file</span>
                      <span class="text-xs opacity-70" data-slot="description">
                        Move to trash
                      </span>
                    </div>
                  </ListBox.Item>
                </ListBox.Section>
              </ListBox>
              <p class="text-xs opacity-70">Last action: {lastListAction() ?? "None"}</p>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Long List (Scrollable)</h3>
              <ListBox
                selectionMode="multiple"
                class="max-h-56 max-w-xs overflow-y-auto rounded-3xl border border-base-300 bg-base-100 p-2"
                items={LISTBOX_LONG_ITEMS}
              >
                {(item) => {
                  const entry = item as (typeof LISTBOX_LONG_ITEMS)[number];
                  return (
                    <ListBox.Item id={entry.id} textValue={entry.label}>
                      <span data-slot="label">{entry.label}</span>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  );
                }}
              </ListBox>
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
          <div>
            <h2 class="text-sm font-semibold">Menu</h2>
            <p class="text-xs opacity-70">
              HeroUI-style menu with item indicators, disabled states, sections, and actions.
            </p>
          </div>

          <div class="grid gap-6 lg:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Single Selection</h3>
              <Menu
                selectionMode="single"
                selectedKeys={selectedMenuMode()}
                onSelectionChange={(keys) => setSelectedMenuMode(new Set(keys))}
                class="max-w-xs rounded-3xl border border-base-300 bg-base-100 p-2"
              >
                <Menu.Item id="preview" textValue="Preview">
                  <span data-slot="label">Preview</span>
                  <Menu.ItemIndicator />
                </Menu.Item>
                <Menu.Item id="edit" textValue="Edit">
                  <span data-slot="label">Edit</span>
                  <Menu.ItemIndicator />
                </Menu.Item>
                <Menu.Item id="duplicate" textValue="Duplicate">
                  <span data-slot="label">Duplicate</span>
                  <Menu.ItemIndicator />
                </Menu.Item>
              </Menu>
              <p class="text-xs opacity-70">
                Selected: {Array.from(selectedMenuMode()).join(", ") || "None"}
              </p>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Disabled + Action</h3>
              <Menu
                selectionMode="none"
                disabledKeys={["archive"]}
                onAction={(key) => setLastMenuAction(key)}
                class="max-w-xs rounded-3xl border border-base-300 bg-base-100 p-2"
              >
                <Menu.Item id="share" textValue="Share">
                  <span data-slot="label">Share</span>
                </Menu.Item>
                <Menu.Item id="archive" textValue="Archive">
                  <span data-slot="label">Archive</span>
                </Menu.Item>
                <Menu.Item id="delete" textValue="Delete" variant="danger">
                  <span data-slot="label">Delete</span>
                </Menu.Item>
              </Menu>
              <p class="text-xs opacity-70">Last action: {lastMenuAction() ?? "None"}</p>
            </div>
          </div>

          <div class="grid gap-6 lg:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Sections</h3>
              <Menu
                selectionMode="none"
                onAction={(key) => setLastMenuAction(key)}
                class="max-w-xs rounded-3xl border border-base-300 bg-base-100 p-2"
              >
                <Menu.Section title={<span class="px-2 py-1 text-xs font-semibold">File</span>}>
                  <Menu.Item id="new" textValue="New">
                    <span data-slot="label">New</span>
                  </Menu.Item>
                  <Menu.Item id="open" textValue="Open">
                    <span data-slot="label">Open</span>
                  </Menu.Item>
                </Menu.Section>
                <Separator />
                <Menu.Section title={<span class="px-2 py-1 text-xs font-semibold">Advanced</span>}>
                  <Menu.Item id="history" textValue="History" hasSubmenu>
                    <span data-slot="label">History</span>
                    <Menu.Item.SubmenuIndicator />
                  </Menu.Item>
                </Menu.Section>
              </Menu>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Multiple + Dot Indicator</h3>
              <Menu
                selectionMode="multiple"
                selectedKeys={selectedMenuFilters()}
                onSelectionChange={(keys) => setSelectedMenuFilters(new Set(keys))}
                class="max-w-xs rounded-3xl border border-base-300 bg-base-100 p-2"
              >
                <Menu.Item id="all" textValue="All">
                  <span data-slot="label">All</span>
                  <Menu.ItemIndicator type="dot" />
                </Menu.Item>
                <Menu.Item id="mentions" textValue="Mentions">
                  <span data-slot="label">Mentions</span>
                  <Menu.ItemIndicator type="dot" />
                </Menu.Item>
                <Menu.Item id="unread" textValue="Unread">
                  <span data-slot="label">Unread</span>
                  <Menu.ItemIndicator type="dot" />
                </Menu.Item>
              </Menu>
              <p class="text-xs opacity-70">
                Selected: {Array.from(selectedMenuFilters()).join(", ") || "None"}
              </p>
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
            <h2 class="text-sm font-semibold">Checkbox Group</h2>
            <p class="text-xs opacity-70">
              HeroUI-style grouped checkboxes with shared variant and controlled values.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Basic</h3>
              <CheckboxGroup name="interests-basic">
                <Checkbox value="design">Design</Checkbox>
                <Checkbox value="engineering">Engineering</Checkbox>
                <Checkbox value="product">Product</Checkbox>
              </CheckboxGroup>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Uncontrolled</h3>
              <CheckboxGroup name="interests-uncontrolled" defaultValue={["docs", "qa"]}>
                <Checkbox value="docs">Documentation</Checkbox>
                <Checkbox value="qa">Quality Assurance</Checkbox>
                <Checkbox value="research">Research</Checkbox>
              </CheckboxGroup>
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Controlled</h3>
              <CheckboxGroup
                name="channels"
                value={selectedChannels()}
                onChange={setSelectedChannels}
                variant="secondary"
              >
                <Checkbox value="email">Email</Checkbox>
                <Checkbox value="sms">SMS</Checkbox>
                <Checkbox value="push">Push</Checkbox>
              </CheckboxGroup>
              <p class="text-xs opacity-70">Selected: {selectedChannels().join(", ") || "None"}</p>
            </div>

            <div class="space-y-3">
              <h3 class="text-xs font-semibold uppercase opacity-70">Disabled</h3>
              <CheckboxGroup name="disabled-flags" isDisabled defaultValue={["feature-1"]}>
                <Checkbox value="feature-1">Feature Flag 1</Checkbox>
                <Checkbox value="feature-2">Feature Flag 2</Checkbox>
              </CheckboxGroup>
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
