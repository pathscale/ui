import Button, { type ButtonVariantProps } from "../../src/components/button";
import Input from "../../src/components/input";
import Textarea from "../../src/components/textarea";
import Tooltip from "../../src/components/tooltip";
import { createSignal, For } from "solid-js";
import Avatar from "../../src/components/Avatar";

export default function App() {
  const [color, setColor] =
    createSignal<ButtonVariantProps["color"]>("primary");

  const [username, setUsername] = createSignal("the_boogeyman");
  const [password, setPassword] = createSignal("Daisy");

  return (
    <>
      <main class="flex flex-col gap-10 p-6 max-w-xl mx-auto">
        <section class="space-y-2">
          <h2 class="text-lg font-semibold">Button</h2>
          <div class="flex items-center gap-2">
            <select
              name="color"
              id="color"
              value={color()}
              onChange={(e) =>
                setColor(e.currentTarget.value as ButtonVariantProps["color"])
              }
              class="border rounded px-2 py-1"
            >
              <For
                each={[
                  "inverse",
                  "primary",
                  "secondary",
                  "tertiary",
                  "accent",
                  "positive",
                  "destructive",
                ]}
              >
                {(color) => <option value={color}>{color}</option>}
              </For>
            </select>
            <Button color={color()}>Button</Button>
          </div>
        </section>

        <section class="space-y-2">
          <h2 class="text-lg font-semibold">Input</h2>
          <Input
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value)}
            placeholder="the_boogeyman"
          />
          <Input
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            placeholder="Password"
            type="password"
            passwordReveal
            color="danger"
          />
        </section>

        <section class="space-y-2">
          <h2 class="text-lg font-semibold">Avatar</h2>
          <div class="flex gap-4">
            <Avatar
              alt="John Doe"
              shape="circle"
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
              dataSrc="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
            />
            <Avatar
              alt="Jane Doe"
              shape="rounded"
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
              dataSrc="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
            />
          </div>
        </section>

        <section class="space-y-2">
          <h2 class="text-lg font-semibold">Textarea</h2>
          <Textarea
            placeholder="Write your thoughts..."
            color="primary"
            size="md"
            resize="y"
            hasCounter
            maxlength={144}
            value=""
            onInput={(e) => console.log(e.currentTarget.value)}
          />
        </section>

        <section class="space-y-2">
          <h2 class="text-lg font-semibold">Tooltip</h2>

          {/* Colors */}
          <div class="flex gap-4 flex-wrap items-center">
            <Tooltip type="info" label="info">
              <button class="bg-blue-500 text-white px-3 py-1 rounded">
                Info
              </button>
            </Tooltip>
            <Tooltip type="success" label="success">
              <button class="bg-green-500 text-white px-3 py-1 rounded">
                Success
              </button>
            </Tooltip>
            <Tooltip type="warning" label="warning">
              <button class="bg-yellow-500 text-white px-3 py-1 rounded">
                Warning
              </button>
            </Tooltip>
            <Tooltip type="danger" label="danger">
              <button class="bg-red-500 text-white px-3 py-1 rounded">
                Danger
              </button>
            </Tooltip>
            <Tooltip type="primary" label="primary">
              <button class="bg-indigo-500 text-white px-3 py-1 rounded">
                Primary
              </button>
            </Tooltip>
            <Tooltip type="gray" label="gray">
              <button class="bg-gray-700 text-white px-3 py-1 rounded">
                Gray
              </button>
            </Tooltip>
          </div>

          {/* Sizes */}
          <div class="flex gap-4 flex-wrap items-center">
            <Tooltip size="sm" label="Small tooltip" multilined>
              <button class="bg-gray-700 text-white px-3 py-1 rounded">
                Small
              </button>
            </Tooltip>
            <Tooltip size="md" label="Medium tooltip" multilined>
              <button class="bg-gray-700 text-white px-3 py-1 rounded">
                Medium
              </button>
            </Tooltip>
            <Tooltip size="lg" label="Large tooltip" multilined>
              <button class="bg-gray-700 text-white px-3 py-1 rounded">
                Large
              </button>
            </Tooltip>
          </div>

          {/* Styles: rounded, dashed, multilined */}
          <div class="flex gap-4 flex-wrap items-center">
            <Tooltip label="Squared tooltip" rounded={false}>
              <button class="bg-blue-500 text-white px-3 py-1 rounded">
                Squared
              </button>
            </Tooltip>
            <Tooltip label="Dashed tooltip" dashed>
              <button class="bg-green-500 text-white px-3 py-1 rounded">
                Dashed
              </button>
            </Tooltip>
            <Tooltip label="Multilined\nTooltip with\nline breaks" multilined>
              <button class="bg-yellow-500 text-white px-3 py-1 rounded">
                Multilined
              </button>
            </Tooltip>
          </div>

          {/* Always visible */}
          <div class="flex gap-4 flex-wrap items-center">
            <Tooltip label="Always visible" always position="right">
              <button class="bg-green-500 text-white px-3 py-1 rounded">
                Always
              </button>
            </Tooltip>
          </div>

          {/* Animated + Delay */}
          <div class="flex gap-4 flex-wrap items-center">
            <Tooltip label="Appears after 500ms" delay={500}>
              <button class="bg-red-500 text-white px-3 py-1 rounded">
                Delay
              </button>
            </Tooltip>
            <Tooltip label="Animated tooltip" animated position="right">
              <button class="bg-blue-500 text-white px-3 py-1 rounded">
                Animated
              </button>
            </Tooltip>
          </div>
        </section>
      </main>
    </>
  );
}
