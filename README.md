# @pathscale/ui

Highly opinionated SolidJS component library — batteries and kitchen sink included, but
optimized and shiny.

**103 components.** HeroUI-parity API, daisyUI-style theming, Tailwind v4 tokens, light and
dark themes built in.

**[→ Browse every component, live](https://js.software)**

## Install

```sh
bun add @pathscale/ui solid-layouts
bun add -d rsbuild-plugin-solid-layouts
```

<details>
<summary>npm · pnpm · yarn</summary>

```sh
npm install @pathscale/ui solid-layouts && npm install -D rsbuild-plugin-solid-layouts
pnpm add @pathscale/ui solid-layouts && pnpm add -D rsbuild-plugin-solid-layouts
yarn add @pathscale/ui solid-layouts && yarn add -D rsbuild-plugin-solid-layouts
```

</details>

## Setup

`@pathscale/ui` 2.x is a compiled Layout bundle. Configure the application compiler before
Solid transforms JSX:

```ts
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginSolid } from "@rsbuild/plugin-solid";
import { defineConfig } from "@rsbuild/core";
import { pluginSolidLayoutsApplication } from "rsbuild-plugin-solid-layouts";

export default defineConfig({
  plugins: [
    pluginSolidLayoutsApplication({ layouts: ["@pathscale/ui"] }),
    pluginBabel({ include: /\.(?:jsx|tsx|ts)$/ }),
    pluginSolid(),
  ],
});
```

The Layout plugin must run before Solid. A missing package, manifest, recipe, compiler, or
runtime is an error; there is no uncompiled fallback.

Two imports. Everything comes from the root barrel, and **one stylesheet is all you need** —
`index.css` pulls in the base styles, both themes and the icon set:

```tsx
import { Button, Flex } from "@pathscale/ui";
import "@pathscale/ui/index.css";

export const Example = () => (
  <Flex direction="col" gap="sm">
    <Button variant="primary" size="md">Primary</Button>
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
- **Sizes and variants are per-component.** `Button` takes
  `variant` (`primary | secondary | tertiary | outline | ghost | danger | danger-soft`)
  and `size` (`sm | md | lg`); a smaller set of components — `Badge`, `Chip`, `Avatar`,
  `Spinner`, `Toggle`, the progress components — take `color` instead. Check the
  component's own types, or the [showcase](https://js.software), rather than assuming a
  shared union.
- **Both `class` and `className` work** everywhere, and your classes win — they are merged
  last via twMerge.
- **Controlled/uncontrolled come in triples**: `isOpen/defaultOpen/onOpenChange`,
  `value/defaultValue/onChange`. Callbacks pass **values, not events**.
- **Compound components** (`Modal.Trigger`, `Tabs.List`, `Select.Option`) are also exported
  flat. Parts are styleable via `data-slot` and state attributes such as `data-open`.
- There is **no polymorphic `as` prop**.

Forms are built in and take any Standard Schema validator; DataGrid derives filtering,
sorting, pagination and selection itself. Both, with toasts, icons and dates, are covered in
**[docs/ui-usage.md](https://github.com/pathscale/ui/blob/master/docs/ui-usage.md)**.

## Requirements

- **SolidJS ^1.9**
- **solid-layouts** runtime
- **rsbuild-plugin-solid-layouts** application compiler integration
- **Tailwind v4** — optional, but required for the `@theme` token utilities

## Migrating from 1.x

`1.4.0` is the last pre-Layouts 1.x release. Layout-authored components begin at `2.0.0` and
require the setup above. Versions `1.5.0` and `1.6.0` were incorrectly published on the 1.x
line and must not be used.

The complete compiler contract, hard-error behavior, commands, and porting analyzer are
documented in [docs/layouts.md](docs/layouts.md).

Two peers are optional and only needed for the features they back: `popmotion` (JS animation
driver) and `@standard-schema/spec` (schema validation).

## Subpath exports

Everything is available from the root barrel. These exist when you want to be narrower:

```ts
import { Button } from "@pathscale/ui/components/button";
import { useAnchoredOverlayPosition } from "@pathscale/ui/hooks/table";
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
| **[Contributing](https://github.com/pathscale/ui/blob/master/CONTRIBUTING.md)** | local setup, component checklist, proposal template |
| **[Releasing](https://github.com/pathscale/ui/blob/master/docs/releasing.md)** | how a push to master becomes an npm version, and the gates it passes |

## License

MIT
