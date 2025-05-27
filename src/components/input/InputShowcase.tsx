import type { Component } from "solid-js";
import { Input } from "../../";

const InputShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default Input</h2>
        <Input placeholder="Type here..." />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Brand Colors</h2>
        <div class="flex flex-col gap-2 w-full max-w-xs">
          <Input color="primary" placeholder="Primary" />
          <Input color="secondary" placeholder="Secondary" />
          <Input color="accent" placeholder="Accent" />
          <Input color="info" placeholder="Info" />
          <Input color="success" placeholder="Success" />
          <Input color="warning" placeholder="Warning" />
          <Input color="error" placeholder="Error" />
          <Input color="ghost" placeholder="Ghost" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Sizes</h2>
        <div class="flex flex-col gap-2 w-full max-w-xs">
          <Input size="xl" placeholder="XL" />
          <Input size="lg" placeholder="Large" />
          <Input size="md" placeholder="Medium (default)" />
          <Input size="sm" placeholder="Small" />
          <Input size="xs" placeholder="Extra small" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Disabled</h2>
        <div class="flex flex-col gap-2 w-full max-w-xs">
          <Input disabled placeholder="Disabled input" />
          <Input class="input-disabled" placeholder="Disabled via class" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Different Types
        </h2>
        <div class="flex flex-col gap-2 w-full max-w-xs">
          <Input type="text" placeholder="Text" />
          <Input type="email" placeholder="Email" />
          <Input type="password" placeholder="Password" />
          <Input type="number" placeholder="Number" />
        </div>
      </section>
    </div>
  );
};

export default InputShowcase;
