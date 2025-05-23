import { type Component } from "solid-js";
import { Button } from "../../";

const ButtonShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default Button</h2>
        <Button>Button</Button>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Brand Colors</h2>
        <div class="flex flex-wrap items-center gap-2">
          <Button>Default</Button>
          <Button color="neutral">Neutral</Button>
          <Button color="primary">Primary</Button>
          <Button color="secondary">Secondary</Button>
          <Button color="accent">Accent</Button>
          <Button color="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Soft Style</h2>
        <div class="flex flex-wrap items-center gap-2">
          <Button variant="soft">Default</Button>
          <Button variant="soft" color="primary">
            Primary
          </Button>
          <Button variant="soft" color="secondary">
            Secondary
          </Button>
          <Button variant="soft" color="accent">
            Accent
          </Button>
          <Button variant="soft" color="info">
            Info
          </Button>
          <Button variant="soft" color="success">
            Success
          </Button>
          <Button variant="soft" color="warning">
            Warning
          </Button>
          <Button variant="soft" color="error">
            Error
          </Button>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Outline Style</h2>
        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline">Default</Button>
          <Button variant="outline" color="primary">
            Primary
          </Button>
          <Button variant="outline" color="secondary">
            Secondary
          </Button>
          <Button variant="outline" color="accent">
            Accent
          </Button>
          <Button variant="outline" color="info">
            Info
          </Button>
          <Button variant="outline" color="success">
            Success
          </Button>
          <Button variant="outline" color="warning">
            Warning
          </Button>
          <Button variant="outline" color="error">
            Error
          </Button>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Dash Style</h2>
        <div class="flex flex-wrap items-center gap-2">
          <Button variant="dash">Default</Button>
          <Button variant="dash" color="primary">
            Primary
          </Button>
          <Button variant="dash" color="secondary">
            Secondary
          </Button>
          <Button variant="dash" color="accent">
            Accent
          </Button>
          <Button variant="dash" color="info">
            Info
          </Button>
          <Button variant="dash" color="success">
            Success
          </Button>
          <Button variant="dash" color="warning">
            Warning
          </Button>
          <Button variant="dash" color="error">
            Error
          </Button>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Active Buttons</h2>
        <div class="flex flex-wrap items-center gap-2">
          <Button active>Default</Button>
          <Button active color="neutral">
            Neutral
          </Button>
          <Button active color="primary">
            Primary
          </Button>
          <Button active color="secondary">
            Secondary
          </Button>
          <Button active color="accent">
            Accent
          </Button>
          <Button active color="ghost">
            Ghost
          </Button>
          <Button active variant="link">
            Link
          </Button>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Button Sizes</h2>
        <div class="flex flex-wrap items-center gap-2">
          <Button size="lg">Large</Button>
          <Button>Normal</Button>
          <Button size="sm">Small</Button>
          <Button size="xs">Tiny</Button>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Responsive & Wide Buttons
        </h2>
        <div class="space-y-4">
          <div>
            <Button responsive>Responsive</Button>
          </div>
          <div>
            <Button wide>Wide</Button>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Glass Button</h2>
        <div
          class="w-full flex justify-center py-8 rounded-md bg-cover bg-center"
          style={{
            "background-image":
              "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)",
          }}
        >
          <Button glass>Glass button</Button>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Different HTML Tags
        </h2>
        <div class="flex flex-wrap gap-2 items-center">
          <Button<"a"> as="a" href="#" role="button">
            Link
          </Button>
          <Button type="submit">Button</Button>
          <Button as="div">Div</Button>
          <Button as="span">Span</Button>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Disabled Buttons
        </h2>
        <div class="flex flex-wrap items-center gap-2">
          <Button disabled>Disabled using attribute</Button>
          <Button
            class="btn-disabled"
            tabIndex={-1}
            role="button"
            aria-disabled="true"
          >
            Disabled using class name
          </Button>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Square & Circle Buttons
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <Button shape="square">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
            <Button shape="square" variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
          <div class="flex items-center gap-2">
            <Button shape="circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
            <Button shape="circle" variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Buttons with Icons
        </h2>
        <div class="flex flex-wrap items-center gap-2">
          <Button
            startIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            }
          >
            Icon at Start
          </Button>
          <Button
            endIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            }
          >
            Icon at End
          </Button>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Block Button</h2>
        <Button fullWidth>Block</Button>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Loading States</h2>
        <div class="flex flex-wrap items-center gap-2">
          <Button loading shape="square" />
          <Button loading>loading</Button>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Without Animation
        </h2>
        <Button animation={false}>I don't have click animation</Button>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Link Button</h2>
        <Button<"a">
          as="a"
          target="_blank"
          rel="noopener"
          href="https://daisyui.com/"
        >
          Link
        </Button>
      </section>
    </div>
  );
};

export default ButtonShowcase;
