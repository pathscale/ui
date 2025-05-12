import Button, { type ButtonVariantProps } from "../../src/components/button";
import Input from "../../src/components/input";
import Textarea from "../../src/components/textarea";
import Tag from "../../src/components/tag";
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
          <h2 class="text-lg font-semibold">Tag</h2>

          <div class="flex flex-wrap gap-2">
            <Tag type="primary">Primary</Tag>
            <Tag type="success">Success</Tag>
            <Tag type="warning">Warning</Tag>
            <Tag type="danger">Danger</Tag>
            <Tag type="info">Info</Tag>
            <Tag type="dark">Dark</Tag>
          </div>

          <div class="flex flex-wrap gap-2">
            <Tag size="normal" type="dark">
              Default
            </Tag>
            <Tag size="medium" type="primary">
              Medium
            </Tag>
            <Tag size="large" type="info">
              Large
            </Tag>
          </div>

          <div class="flex flex-wrap gap-2">
            <Tag disabled type="info">
              Disabled
            </Tag>
          </div>

          <div class="flex flex-wrap gap-2">
            <Tag closable onClose={() => console.log("Closed")}>
              Closable
            </Tag>
            <Tag
              attached
              closable
              onClose={() => console.log("Attached closed")}
            >
              Attached
            </Tag>
          </div>
        </section>
      </main>
    </>
  );
}
