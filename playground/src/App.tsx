import { For } from "solid-js";
import { Badge } from "@pathscale/ui";

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
          <div class="flex flex-wrap gap-6">
            <For each={BADGE_COLORS}>
              {(color) => (
                <div class="flex flex-col items-center gap-2">
                  <Badge.Anchor>
                    <div class="h-14 w-14 rounded-box border border-base-300 bg-base-100" />
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

        <section class="space-y-3 rounded-box border border-base-300 bg-base-200 p-4">
          <h2 class="text-sm font-semibold">Variants</h2>
          <div class="flex flex-wrap gap-6">
            <For each={BADGE_VARIANTS}>
              {(variant) => (
                <div class="flex flex-col items-center gap-2">
                  <Badge.Anchor>
                    <div class="h-14 w-14 rounded-box border border-base-300 bg-base-100" />
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

        <section class="space-y-3 rounded-box border border-base-300 bg-base-200 p-4">
          <h2 class="text-sm font-semibold">Sizes</h2>
          <div class="flex flex-wrap items-center gap-6">
            <For each={BADGE_SIZES}>
              {(size) => (
                <div class="flex flex-col items-center gap-2">
                  <Badge.Anchor>
                    <div class="h-14 w-14 rounded-box border border-base-300 bg-base-100" />
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

        <section class="space-y-3 rounded-box border border-base-300 bg-base-200 p-4">
          <h2 class="text-sm font-semibold">Placements</h2>
          <div class="flex flex-wrap gap-8">
            <For each={BADGE_PLACEMENTS}>
              {(placement) => (
                <div class="flex flex-col items-center gap-2">
                  <Badge.Anchor>
                    <div class="h-16 w-16 rounded-box border border-base-300 bg-base-100" />
                    <Badge color="accent" size="sm" placement={placement} />
                  </Badge.Anchor>
                  <span class="text-xs opacity-70">{placement}</span>
                </div>
              )}
            </For>
          </div>
        </section>

        <section class="space-y-3 rounded-box border border-base-300 bg-base-200 p-4">
          <h2 class="text-sm font-semibold">Dot Mode (Empty Content)</h2>
          <div class="flex flex-wrap gap-6">
            <For each={BADGE_SIZES}>
              {(size) => (
                <Badge.Anchor>
                  <div class="h-16 w-16 rounded-box border border-base-300 bg-base-100" />
                  <Badge color="success" size={size} placement="bottom-right" />
                </Badge.Anchor>
              )}
            </For>
          </div>
        </section>
      </div>
    </main>
  );
}
