import Button, { type ButtonVariantProps } from "../../src/components/button";
import Input from "../../src/components/input";
import { createSignal, For } from "solid-js";
import Avatar from '../../src/components/Avatar';

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
      <div class="flex gap-2">
        <Avatar
          alt="John Doe"
          background="has-background-info"
          text="has-text-dark"
          src="https://example.com/john-doe.jpg"
          dataSrc="https://example.com/john-doe.jpg"
          customClass="custom-avatar-class"
          rounded={true}
        />
      </div>
    </>
  );
}
