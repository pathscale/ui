import { type Component } from "solid-js";
import Badge from "./Badge";

const BadgeShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default Badge</h2>
        <Badge>Default</Badge>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Brand Colors</h2>
        <div class="flex flex-wrap gap-2">
          <Badge color="neutral">Neutral</Badge>
          <Badge color="primary">Primary</Badge>
          <Badge color="secondary">Secondary</Badge>
          <Badge color="accent">Accent</Badge>
          <Badge color="ghost">Ghost</Badge>
          <Badge color="info">Info</Badge>
          <Badge color="success">Success</Badge>
          <Badge color="warning">Warning</Badge>
          <Badge color="error">Error</Badge>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Sizes</h2>
        <div class="flex flex-wrap gap-2 items-center">
          <Badge size="xl">XL</Badge>
          <Badge size="lg">Large</Badge>
          <Badge size="md">Medium</Badge>
          <Badge size="sm">Small</Badge>
          <Badge size="xs">Tiny</Badge>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Variants</h2>
        <div class="flex flex-wrap gap-2 items-center">
          <Badge variant="soft" color="primary">
            Soft
          </Badge>
          <Badge variant="outline" color="primary">
            Outline
          </Badge>
          <Badge variant="dash" color="primary">
            Dash
          </Badge>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Responsive Badge
        </h2>
        <Badge responsive>Responsive</Badge>
      </section>
    </div>
  );
};

export default BadgeShowcase;
