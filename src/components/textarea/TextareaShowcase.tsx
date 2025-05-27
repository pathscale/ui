import type { Component } from "solid-js";
import Textarea from "./Textarea";

const TextareaShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Default Textarea
        </h2>
        <Textarea placeholder="Write something..." />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Brand Colors</h2>
        <div class="flex flex-col gap-2 w-full max-w-md">
          <Textarea color="primary" placeholder="Primary" />
          <Textarea color="secondary" placeholder="Secondary" />
          <Textarea color="accent" placeholder="Accent" />
          <Textarea color="info" placeholder="Info" />
          <Textarea color="success" placeholder="Success" />
          <Textarea color="warning" placeholder="Warning" />
          <Textarea color="error" placeholder="Error" />
          <Textarea color="ghost" placeholder="Ghost" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Sizes</h2>
        <div class="flex flex-col gap-2 w-full max-w-md">
          <Textarea size="xl" placeholder="XL" />
          <Textarea size="lg" placeholder="Large" />
          <Textarea size="md" placeholder="Medium (default)" />
          <Textarea size="sm" placeholder="Small" />
          <Textarea size="xs" placeholder="Extra small" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Disabled</h2>
        <div class="flex flex-col gap-2 w-full max-w-md">
          <Textarea disabled placeholder="Disabled textarea" />
          <Textarea
            class="textarea-disabled"
            placeholder="Disabled via class"
          />
        </div>
      </section>
    </div>
  );
};

export default TextareaShowcase;
