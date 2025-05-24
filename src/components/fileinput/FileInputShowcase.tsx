import type { Component } from "solid-js";
import FileInput from "./FileInput";

const FileInputShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Default FileInput
        </h2>
        <FileInput />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Sizes</h2>
        <div class="flex flex-col gap-2 w-full max-w-xs">
          <FileInput size="xl" />
          <FileInput size="lg" />
          <FileInput size="md" />
          <FileInput size="sm" />
          <FileInput size="xs" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Colors</h2>
        <div class="flex flex-col gap-2 w-full max-w-xs">
          <FileInput color="primary" />
          <FileInput color="secondary" />
          <FileInput color="accent" />
          <FileInput color="info" />
          <FileInput color="success" />
          <FileInput color="warning" />
          <FileInput color="error" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Bordered</h2>
        <FileInput bordered />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Disabled</h2>
        <FileInput disabled />
      </section>
    </div>
  );
};

export default FileInputShowcase;
