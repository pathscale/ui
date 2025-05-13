import Button, { type ButtonVariantProps } from "../../src/components/button";
import Input from "../../src/components/input";
import Textarea from "../../src/components/textarea";
import Switch from "../../src/components/switch";
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
          <h2 class="text-lg font-semibold">Switch</h2>
          <div class="space-y-2">
            <Switch>Default</Switch>
            <Switch color="green" outlined>
              Success
            </Switch>
            <Switch color="red" disabled>
              Disabled
            </Switch>
            <Switch color="yellow" rounded={false}>
              Square
            </Switch>
          </div>
          <div>
            <Switch size="sm" color="green" passiveColor="green">
              Small
            </Switch>
            <Switch size="md" color="yellow" passiveColor="yellow">
              Medium
            </Switch>
            <Switch size="lg" color="red" passiveColor="red">
              Large
            </Switch>
          </div>
          <div class="space-y-2">
            <Switch
              checked
              onChange={(val) => console.log("Switched to", val)}
              color="gray"
            >
              Value
            </Switch>
            <Switch color="blue" passiveColor="red">
              Blue / Passive Red
            </Switch>
            <Switch color="red" passiveColor="blue">
              Red / Passive Blue
            </Switch>
          </div>
        </section>
      </main>
    </>
  );
}
