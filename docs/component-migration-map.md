# Component Migration Map

> **This describes the 2.x HeroUI migration, not the current API, and three of
> its renames now point backwards.**
>
> It was written when `Progress` was being split into `ProgressBar` and
> `ProgressCircle`. `0419faf` later reversed that: what ships is `Progress` and
> `RadialProgress`, and neither `ProgressBar` nor `ProgressCircle` exists. It
> also lists `Dock` as removed with no replacement; `Dock` is what
> `FloatingDock` was renamed to, and it ships.
>
> Four separate fleet migrations were sent the wrong way by this file in one
> day. The **removed** list below is still accurate and still worth checking
> before assuming a component exists. The **rename** table is not: use
> `api-contract.md`, which `bun run check:api` fails the build over, so it
> cannot drift from the code the way this did.
>
> The current renames are:
>
>     Callout      -> Alert        EmptyState     -> Empty
>     Toggle       -> Switch       ProgressBar    -> Progress
>     Modal        -> Dialog       ProgressCircle -> RadialProgress
>     TextArea     -> Textarea     ScrollShadow   -> ScrollArea
>     Disclosure   -> Collapsible  Breadcrumbs    -> Breadcrumb
>     FloatingDock -> Dock

This document was the canonical mapping between deprecated/old `@pathscale/ui` components and their current equivalents after the HeroUI migration and `.classes.ts` refactor.

## Registry

```ts
export const COMPONENT_MIGRATION_MAP = {
  // Renamed (1:1)
  Loading: {
    type: "renamed",
    to: "Spinner",
    note: "Loading is still exported as an alias of Spinner for backward compatibility.",
  },
  DropdownSelect: { type: "renamed", to: "Select" },
  RadialProgress: { type: "renamed", to: "ProgressCircle" },
  RangeSlider: {
    type: "renamed",
    to: "Slider",
    note: "HeroUI Slider now lives under components/slider.",
  },

  // Split (1:many)
  Progress: {
    type: "split",
    to: ["ProgressBar", "ProgressCircle"],
    note: "Use ProgressBar for linear progress and ProgressCircle for circular progress.",
  },

  // Removed (no replacement)
  Background: { type: "removed", to: null },
  BottomSheet: { type: "removed", to: null },
  BrowserMockup: { type: "removed", to: null },
  Carousel: { type: "removed", to: null },
  CodeMockup: { type: "removed", to: null },
  Collapse: { type: "removed", to: null },
  ConfirmDialog: { type: "removed", to: null },
  ConnectionStatus: { type: "removed", to: null },
  CopyButton: { type: "removed", to: null },
  Countdown: { type: "removed", to: null },
  Diff: { type: "removed", to: null },
  Divider: { type: "removed", to: null },
  Dock: { type: "removed", to: null },
  FileInput: { type: "removed", to: null },
  FormActions: { type: "removed", to: null },
  Hero: { type: "removed", to: null },
  Indicator: { type: "removed", to: null },
  Mask: { type: "removed", to: null },
  PhoneMockup: { type: "removed", to: null },
  PropsTable: { type: "removed", to: null },
  Range: { type: "removed", to: null },
  Rating: { type: "removed", to: null },
  SkipLink: { type: "removed", to: null },
  Stack: { type: "removed", to: null },
  StatCard: { type: "removed", to: null },
  Stats: { type: "removed", to: null },
  Status: { type: "removed", to: null },
  Steps: { type: "removed", to: null },
  Swap: { type: "removed", to: null },
  SvgBackground: { type: "removed", to: null },
  SwitchField: { type: "removed", to: null },
  Showcase: { type: "removed", to: null },
  ShowcaseSection: { type: "removed", to: null },
  Timeline: { type: "removed", to: null },
  ToastContainer: {
    type: "removed",
    to: null,
    note: "Use the new Toast system (Toast/ToastProvider/ToastQueue).",
  },
  ToastStack: {
    type: "removed",
    to: null,
    note: "Use the new Toast system (Toast/ToastProvider/ToastQueue).",
  },
  StreamingTable: {
    type: "removed",
    to: null,
    note: "Use FlexGrid with createFlexGrid, fed by useStreamingBuffer.",
  },
  EnhancedTable: {
    type: "removed",
    to: null,
    note: "Use DataGrid with createDataGrid.",
  },
  WindowMockup: { type: "removed", to: null },

  // Deprecated utilities/exports removed
  ColorPickerContext: { type: "removed", to: null },
  ColorUtils: { type: "removed", to: null },
  Artboard: { type: "removed", to: null },
} as const;
```

## Reverse Map

```ts
export const NEW_COMPONENT_TO_OLD_MAP = {
  Spinner: ["Loading"],
  Select: ["DropdownSelect"],
  ProgressCircle: ["RadialProgress", "Progress"],
  ProgressBar: ["Progress"],
  Slider: ["RangeSlider"],
};
```

## Removed Components

```ts
export const REMOVED_COMPONENTS = [
  "Background",
  "BottomSheet",
  "BrowserMockup",
  "Carousel",
  "CodeMockup",
  "Collapse",
  "ConfirmDialog",
  "ConnectionStatus",
  "CopyButton",
  "Countdown",
  "Diff",
  "Divider",
  "Dock",
  "FileInput",
  "FormActions",
  "Hero",
  "Indicator",
  "Mask",
  "PhoneMockup",
  "PropsTable",
  "Range",
  "Rating",
  "SkipLink",
  "Stack",
  "StatCard",
  "Stats",
  "Status",
  "Steps",
  "Swap",
  "SvgBackground",
  "SwitchField",
  "Showcase",
  "ShowcaseSection",
  "Timeline",
  "ToastContainer",
  "ToastStack",
  "StreamingTable",
  "EnhancedTable",
  "WindowMockup",
  "ColorPickerContext",
  "ColorUtils",
  "Artboard",
];
```

## Import Fix Suggestions

```text
OLD: import { Loading } from "@pathscale/ui"
NEW: import { Spinner } from "@pathscale/ui"

OLD: import { DropdownSelect } from "@pathscale/ui"
NEW: import { Select } from "@pathscale/ui"

OLD: import { RadialProgress } from "@pathscale/ui"
NEW: import { ProgressCircle } from "@pathscale/ui"

OLD: import { RangeSlider } from "@pathscale/ui"
NEW: import { Slider } from "@pathscale/ui"

OLD: import { Progress } from "@pathscale/ui"
NEW: import { ProgressBar } from "@pathscale/ui"
NEW: import { ProgressCircle } from "@pathscale/ui"

OLD: import { ToastContainer } from "@pathscale/ui"
NEW: remove import; migrate to Toast/ToastProvider/ToastQueue

OLD: import { ToastStack } from "@pathscale/ui"
NEW: remove import; migrate to Toast/ToastProvider/ToastQueue

OLD: import { StreamingTable } from "@pathscale/ui"
NEW: remove import; use Table + table hooks

OLD: import { EnhancedTable } from "@pathscale/ui"
NEW: remove import; use Table + table hooks

OLD: import { Background } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { BottomSheet } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { BrowserMockup } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Carousel } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { CodeMockup } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Collapse } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { ConfirmDialog } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { ConnectionStatus } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { CopyButton } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Countdown } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Diff } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Divider } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Dock } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { FileInput } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { FormActions } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Hero } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Indicator } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Mask } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { PhoneMockup } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { PropsTable } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Range } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Rating } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { SkipLink } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Stack } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { StatCard } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Stats } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Status } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Steps } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Swap } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { SvgBackground } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { SwitchField } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Showcase } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { ShowcaseSection } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Timeline } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { WindowMockup } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { ColorPickerContext } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { ColorUtils } from "@pathscale/ui"
NEW: remove import (no replacement)

OLD: import { Artboard } from "@pathscale/ui"
NEW: remove import (no replacement)
```
