import { createSignal } from "solid-js";
import Autocomplete from "./Autocomplete";

const AutocompleteShowcase = () => {
  const fruits = ["Apple", "Banana", "Orange", "Mango", "Pineapple"];
  const [value, setValue] = createSignal("");

  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <div class="w-full max-w-xs">
          <Autocomplete
            label="Choose a fruit"
            items={fruits}
            value={value()}
            onChange={(v) => setValue(String(v))}
          />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Sizes</h2>
        <div class="flex flex-col gap-4 w-full max-w-xs">
          <Autocomplete label="Small" items={fruits} size="sm" />
          <Autocomplete label="Medium (default)" items={fruits} size="md" />
          <Autocomplete label="Large" items={fruits} size="lg" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Disabled</h2>
        <div class="w-full max-w-xs">
          <Autocomplete label="Disabled" items={fruits} disabled />
        </div>
      </section>
    </div>
  );
};

export default AutocompleteShowcase;
