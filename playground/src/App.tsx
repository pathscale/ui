import Button, { type ButtonVariantProps } from "../../src/components/button";
import Input from "../../src/components/input";
import { createSignal, For } from "solid-js";
import Avatar from "../../src/components/Avatar";

export default function App() {
  const [color, setColor] =
    createSignal<ButtonVariantProps["color"]>("primary");

  const [username, setUsername] = createSignal("the_boogeyman");
  const [password, setPassword] = createSignal("Daisy");

  return (
    <>
      <div class="flex gap-2">
        <select
          name="color"
          id="color"
          value={color()}
          onChange={(e) =>
            setColor(e.currentTarget.value as ButtonVariantProps["color"])
          }
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
        <Avatar
          alt="John Doe"
          shape="circle"
          class="custom-avatar-class"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
          dataSrc="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
        />

        <Avatar
          alt="Jane Doe"
          shape="rounded"
          class="custom-avatar-class"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
          dataSrc="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
        />
      </div>
    </>
  );
}
