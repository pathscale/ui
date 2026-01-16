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
