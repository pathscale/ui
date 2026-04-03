# @pathscale/ui

Highly opinionated SolidJS component library — batteries and kitchen sink
included, but optimized and shiny.

## Install

```sh
bun add @pathscale/ui
```

## Usage

```tsx
import { Button, Flex } from "@pathscale/ui";

export const Example = () => (
  <Flex direction="col" gap="sm">
    <Button color="primary">Primary</Button>
  </Flex>
);
```

## CSS

Import the compatibility stylesheet to use `@pathscale/ui` components without
relying on app-level DaisyUI plugin styles:

```ts
import "@pathscale/ui/dist/styles/compat/daisy-primitives.css";
import "@pathscale/ui/dist/styles/icons/generated-icons.css";
```

## Motion

Shared animation primitives live in `@pathscale/ui/motion`. For setup,
Popmotion driver enablement, and migration notes, see `docs/motion.md`.

## Development

```sh
bun run build
```

Other useful scripts:

- `bun run dev`
- `bun run lint`
- `bun run format`

## Playground Hot Test

Run the playground from the repository root and hot-test local library changes without rebuilding:

```sh
bun run playground:dev
```

The playground resolves `@pathscale/ui` to local `src` via Vite aliases, so edits in `/src` and `/src/styles` refresh immediately.
