import { For } from "solid-js";
import { Badge } from "@pathscale/ui";

const BADGE_COLORS = [
  "default",
  "primary",
  "secondary",
  "accent",
  "info",
  "success",
  "warning",
  "error",
  "neutral",
  "ghost",
] as const;

const BADGE_VARIANTS = ["primary", "secondary", "soft", "outline", "dash"] as const;
const BADGE_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export default function App() {
  return (
    <main class="min-h-screen bg-base-100 text-base-content p-8">
      <div class="mx-auto max-w-5xl space-y-8">
        <header class="space-y-2">
          <h1 class="text-2xl font-semibold">Badge Playground</h1>
          <p class="text-sm opacity-70">Minimal test surface for Badge only.</p>
        </header>

        <section class="space-y-3 rounded-box border border-base-300 bg-base-200 p-4">
          <h2 class="text-sm font-semibold">Colors</h2>
          <div class="flex flex-wrap gap-2">
            <For each={BADGE_COLORS}>
              {(color) => <Badge color={color}>{color}</Badge>}
            </For>
          </div>
        </section>

        <section class="space-y-3 rounded-box border border-base-300 bg-base-200 p-4">
          <h2 class="text-sm font-semibold">Variants</h2>
          <div class="flex flex-wrap gap-2">
            <For each={BADGE_VARIANTS}>
              {(variant) => (
                <Badge color="primary" variant={variant}>
                  {variant}
                </Badge>
              )}
            </For>
          </div>
        </section>

        <section class="space-y-3 rounded-box border border-base-300 bg-base-200 p-4">
          <h2 class="text-sm font-semibold">Sizes</h2>
          <div class="flex flex-wrap items-center gap-2">
            <For each={BADGE_SIZES}>
              {(size) => (
                <Badge color="secondary" size={size}>
                  {size}
                </Badge>
              )}
            </For>
          </div>
        </section>

        <section class="space-y-3 rounded-box border border-base-300 bg-base-200 p-4">
          <h2 class="text-sm font-semibold">Anchor Placement</h2>
          <div class="flex flex-wrap gap-6">
            <Badge.Anchor>
              <div class="h-16 w-16 rounded-box border border-base-300 bg-base-100" />
              <Badge color="success" size="sm" placement="top-right">
                7
              </Badge>
            </Badge.Anchor>
            <Badge.Anchor>
              <div class="h-16 w-16 rounded-box border border-base-300 bg-base-100" />
              <Badge color="warning" variant="soft" size="sm" placement="bottom-left">
                new
              </Badge>
            </Badge.Anchor>
          </div>
        </section>
      </div>
    </main>
  );
}
