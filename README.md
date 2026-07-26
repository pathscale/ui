# @pathscale/ui

Highly opinionated SolidJS component library — batteries and kitchen sink included, but
optimized and shiny.

**103 components.** HeroUI-parity API, daisyUI-style theming, Tailwind v4 tokens, light and
dark themes built in.

**[→ Browse every component, live](https://js.software)**

## Install

```sh
bun add @pathscale/ui
```

<details>
<summary>npm · pnpm · yarn</summary>

```sh
npm install @pathscale/ui
pnpm add @pathscale/ui
yarn add @pathscale/ui
```

</details>

## Setup

Two imports. Everything comes from the root barrel, and **one stylesheet is all you need** —
`index.css` pulls in the base styles, both themes and the icon set:

```tsx
import { Button, Flex } from "@pathscale/ui";
import "@pathscale/ui/index.css";

export const Example = () => (
  <Flex direction="col" gap="sm">
    <Button color="primary" size="md">Primary</Button>
  </Flex>
);
```

## Theming

Two themes ship with the library: `light` (the default when no attribute is set) and `dark`.
Switch globally by setting an attribute on the document:

```ts
document.documentElement.setAttribute("data-theme", "dark");
```

Every component also accepts a `dataTheme` prop, rendered as `data-theme` on that element —
use it to scope a theme to one subtree.

Tokens are CSS custom properties: `--color-primary`, `--color-base-100`, `--radius-field`,
and a glass set among others. `index.css` includes a Tailwind v4 `@theme` block, so in a
Tailwind v4 app the usual utilities — `bg-primary`, `text-base-content`, `bg-base-100` —
work against them directly.

## Components

| family | components |
|---|---|
| **Layout** | Flex, Grid, Join, Surface, Card, GlassPanel, Separator, ScrollShadow, Skeleton, EmptyState, Footer, Header, Navbar, Toolbar, FloatingDock |
| **Typography & misc** | Text, Link, Kbd, Badge, Chip, Tag, TagGroup, Avatar, Icon, Tooltip, Breadcrumbs, Pagination, Meter, ProgressBar, ProgressCircle, Spinner |
| **Inputs** | Input, InputGroup, InputOTP, TextField, TextArea, NumberField, SearchField, PasswordField, ColorField, Checkbox, CheckboxGroup, Radio, RadioGroup, Toggle, Slider, Select, ComboBox, ListBox, SizePicker |
| **Forms** | Form, Fieldset, Label, Description, ErrorMessage, FieldError, PasswordRequirements |
| **Dates** | Calendar, RangeCalendar, DatePicker, DateRangePicker, DateField, TimeField |
| **Color** | ColorPicker, ColorArea, ColorSlider, ColorSwatch, ColorSwatchPicker, ColorWheelFlower, ThemeColorPicker |
| **Overlays** | Modal, Drawer, Popover, Dropdown, Menu, Toast, Alert, Disclosure, DisclosureGroup, Accordion |
| **Data** | Table (headless compound + hooks), Tabs |
| **Auth kit** | AuthForm, AuthCard, AuthFieldGroup, AuthSubmitButton, AuthFooterLinks, AuthPoweredBy, AuthErrorMessage, AuthSuccessMessage |
| **Visual FX** | MetalBorder, GlowCard, NoiseBackground, ImmersiveLanding, VideoPreview, LiveChat, ChatBubble, LanguageSwitcher |

All of them rendered and interactive at **[js.software](https://js.software)**.

## Conventions

The rules that hold across every component — worth two minutes before your first hour:

- **Booleans are HeroUI-style `is*`**: `isDisabled`, `isOpen`, `isInvalid`, `isPending`,
  `isIconOnly`. Native `disabled` is honored too.
- **Sizes** are `xs | sm | md | lg | xl`. **Colors** are
  `neutral | primary | secondary | accent | info | success | warning | error | ghost`.
- **Both `class` and `className` work** everywhere, and your classes win — they are merged
  last via twMerge.
- **Controlled/uncontrolled come in triples**: `isOpen/defaultOpen/onOpenChange`,
  `value/defaultValue/onChange`. Callbacks pass **values, not events**.
- **Compound components** (`Modal.Trigger`, `Tabs.List`, `Select.Option`) are also exported
  flat. Parts are styleable via `data-slot` and state attributes such as `data-open`.
- There is **no polymorphic `as` prop**.

Forms are TanStack Form plus any Standard Schema validator; Table is headless and assembled
from hooks. Both, with toasts, icons and dates, are covered in
**[docs/ui-usage.md](https://github.com/pathscale/ui/blob/master/docs/ui-usage.md)**.

## Requirements

- **SolidJS ^1.9**
- **Tailwind v4** — optional, but required for the `@theme` token utilities

Peers include `@solid-primitives/*`, `@tanstack/solid-form` and `@tanstack/solid-table`.
Two are optional and only needed for the features they back: `popmotion` (JS animation
driver) and `@standard-schema/spec` (schema validation).

## Subpath exports

Everything is available from the root barrel. These exist when you want to be narrower:

```ts
import { Button } from "@pathscale/ui/components/button";
import { useVirtualRows } from "@pathscale/ui/primitives/virtualizer";
import { runMotion, enablePopmotion } from "@pathscale/ui/motion";
```

Also `@pathscale/ui/hooks/*` and `@pathscale/ui/styles/*`.

The package declares `"sideEffects": ["**/*.css"]`, so bundlers tree-shake what you don't
import — the published size is the whole library, not what ships to your users.

## Documentation

| | |
|---|---|
| **[Live showcase](https://js.software)** | every component, rendered and interactive |
| **[Usage reference](https://github.com/pathscale/ui/blob/master/docs/ui-usage.md)** | theming, conventions, forms, table, toast, icons, dates |
| **[Contributing](https://github.com/pathscale/ui/blob/master/CONTRIBUTING.md)** | local setup, playground, component checklist, proposal template |

## License

MIT
