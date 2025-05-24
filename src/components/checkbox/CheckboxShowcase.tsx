import { type Component } from "solid-js";
import Checkbox from "./Checkbox";

const CheckboxShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Default Checkbox
        </h2>
        <Checkbox />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Brand Colors</h2>
        <div class="flex flex-wrap gap-4 items-center">
          <Checkbox color="primary" />
          <Checkbox color="secondary" />
          <Checkbox color="accent" />
          <Checkbox color="info" />
          <Checkbox color="success" />
          <Checkbox color="warning" />
          <Checkbox color="error" />
          <Checkbox color="neutral" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Sizes</h2>
        <div class="flex flex-wrap gap-4 items-center">
          <Checkbox size="xl" />
          <Checkbox size="lg" />
          <Checkbox size="md" />
          <Checkbox size="sm" />
          <Checkbox size="xs" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Indeterminate</h2>
        <Checkbox indeterminate />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Disabled</h2>
        <div class="flex gap-4 items-center">
          <Checkbox disabled />
          <Checkbox class="checkbox-disabled" />
        </div>
      </section>
    </div>
  );
};

export default CheckboxShowcase;
