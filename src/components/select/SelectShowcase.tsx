import { type Component } from "solid-js";
import Select from "./Select";

const SelectShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default Select</h2>
        <Select>
          <option disabled selected>
            Pick one
          </option>
          <option>Apple</option>
          <option>Banana</option>
          <option>Cherry</option>
        </Select>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Brand Colors</h2>
        <div class="flex flex-col gap-2 w-full max-w-xs">
          <Select color="primary">
            <option selected>Primary</option>
          </Select>
          <Select color="secondary">
            <option selected>Secondary</option>
          </Select>
          <Select color="accent">
            <option selected>Accent</option>
          </Select>
          <Select color="info">
            <option selected>Info</option>
          </Select>
          <Select color="success">
            <option selected>Success</option>
          </Select>
          <Select color="warning">
            <option selected>Warning</option>
          </Select>
          <Select color="error">
            <option selected>Error</option>
          </Select>
          <Select color="ghost">
            <option selected>Ghost</option>
          </Select>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Sizes</h2>
        <div class="flex flex-col gap-2 w-full max-w-xs">
          <Select size="xl">
            <option selected>Extra Large</option>
          </Select>
          <Select size="lg">
            <option selected>Large</option>
          </Select>
          <Select size="md">
            <option selected>Medium</option>
          </Select>
          <Select size="sm">
            <option selected>Small</option>
          </Select>
          <Select size="xs">
            <option selected>Extra Small</option>
          </Select>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Disabled</h2>
        <Select disabled>
          <option selected>Disabled Select</option>
        </Select>
      </section>
    </div>
  );
};

export default SelectShowcase;
