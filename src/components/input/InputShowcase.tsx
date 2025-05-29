import { type Component, createSignal } from "solid-js";
import { Input } from "../../";

const InputShowcase: Component = () => {
  const [value, setValue] = createSignal("");

  const lenseIcon = (
    <svg
      class="h-[1em] opacity-50"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <g
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="2.5"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.3-4.3"></path>
      </g>
    </svg>
  );

  const fileIcon = (
    <svg
      class="h-[1em] opacity-50"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <g
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="2.5"
        fill="none"
        stroke="currentColor"
      >
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
      </g>
    </svg>
  );

  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default Input</h2>
        <Input
          placeholder="Type here..."
          value={value()}
          onInput={(e) => setValue(e.currentTarget.value)}
        />
        <div class="text-sm text-[hsl(var(--color-fg-secondary)/1)]">
          Current value: {value() || "(empty)"}
        </div>
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

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Input With Icon
        </h2>
        <div class="flex flex-col gap-2 w-full max-w-xs">
          <Input leftIcon={lenseIcon} type="text" placeholder="Left Icon" />
          <Input
            rightIcon={fileIcon}
            type="password"
            placeholder="Right Icon"
          />
        </div>
      </section>
    </div>
  );
};

export default InputShowcase;
