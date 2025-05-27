import type { Component } from "solid-js";
import { Toggle } from "../../";

const ToggleShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default Toggle</h2>
        <Toggle />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Brand Colors</h2>
        <div class="flex flex-wrap gap-4 items-center">
          <Toggle color="neutral" />
          <Toggle color="primary" />
          <Toggle color="secondary" />
          <Toggle color="accent" />
          <Toggle color="info" />
          <Toggle color="success" />
          <Toggle color="warning" />
          <Toggle color="error" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Sizes</h2>
        <div class="flex flex-wrap gap-4 items-center">
          <Toggle size="xl" />
          <Toggle size="lg" />
          <Toggle size="md" />
          <Toggle size="sm" />
          <Toggle size="xs" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Disabled</h2>
        <div class="flex gap-4 items-center">
          <Toggle disabled />
          <Toggle class="toggle-disabled" />
        </div>
      </section>
    </div>
  );
};

export default ToggleShowcase;
