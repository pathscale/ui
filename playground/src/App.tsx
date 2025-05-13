import Button, { type ButtonVariantProps } from "../../src/components/button";
import Input from "../../src/components/input";
import Textarea from "../../src/components/textarea";
import Checkbox from "../../src/components/checkbox";
import Select from "../../src/components/select";
import Avatar from "../../src/components/Avatar";
import { createSignal, For } from "solid-js";
import Progress from "../../src/components/Progress"

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
            <Select
              placeholder="Select color"
              value={color()}
              onChange={(e) =>
                setColor(e.currentTarget.value as ButtonVariantProps["color"])
              }
            >
              <option value="inverse">Inverse</option>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="tertiary">Tertiary</option>
              <option value="accent">Accent</option>
              <option value="positive">Positive</option>
              <option value="destructive">Destructive</option>
            </Select>
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
          </div>
        </section>
        <section class="space-y-2">
          <h2 class="text-lg font-semibold">Progress</h2>
          <div class="flex gap-4">
            <Progress />
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
          <h2 class="text-lg font-semibold">Checkbox</h2>

          <div class="flex flex-col gap-3">
            <Checkbox
              label="Accept Terms"
              onChange={(e) => console.log("Checked:", e.currentTarget.checked)}
            />

            <Checkbox label="Indeterminate" indeterminate />

            <Checkbox label="Disabled checkbox" checked disabled />
          </div>
        </section>

        <section class="space-y-2">
          <h2 class="text-lg font-semibold">Select</h2>
          <div class="flex flex-col gap-2">
            <Select placeholder="Choose a color" color="info">
              <option value="info">Info</option>
            </Select>
            <Select placeholder="Choose a color" color="success">
              <option value="success">Success</option>
            </Select>
            <Select placeholder="Choose a color" color="warning">
              <option value="warning">Warning</option>
            </Select>
            <Select placeholder="Choose a color" color="danger">
              <option value="danger">Danger</option>
            </Select>
            <Select placeholder="Choose a size" size="sm">
              <option value="sm">Small</option>
            </Select>
            <Select placeholder="Choose a size" size="md">
              <option value="md">Medium</option>
            </Select>
            <Select placeholder="Choose a size" size="lg">
              <option value="lg">Large</option>
            </Select>
            <Select placeholder="Rounded select" color="warning" rounded>
              <option value="rounded">Rounded</option>
            </Select>
            <Select placeholder="Expanded select" color="danger" expanded>
              <option value="expanded">Expanded</option>
            </Select>
          </div>
        </section>
      </main>
    </>
  );
}
