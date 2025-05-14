import Button, { type ButtonVariantProps } from "../../src/components/button";
import Input from "../../src/components/input";
import Textarea from "../../src/components/textarea";
import { Breadcrumb, BreadcrumbItem } from "../../src/components/breadcrumb";
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
          <h2 class="text-lg font-semibold">Breadcrumb</h2>

          <Breadcrumb>
            <BreadcrumbItem href="#">Home</BreadcrumbItem>
            <BreadcrumbItem href="#">Docs</BreadcrumbItem>
            <BreadcrumbItem active>Breadcrumb</BreadcrumbItem>
          </Breadcrumb>

          <Breadcrumb separator="arrow">
            <BreadcrumbItem href="#">Home</BreadcrumbItem>
            <BreadcrumbItem href="#">Docs</BreadcrumbItem>
            <BreadcrumbItem active>Arrow →</BreadcrumbItem>
          </Breadcrumb>

          <Breadcrumb separator="dot">
            <BreadcrumbItem href="#">Home</BreadcrumbItem>
            <BreadcrumbItem href="#">Docs</BreadcrumbItem>
            <BreadcrumbItem active>Dot ·</BreadcrumbItem>
          </Breadcrumb>

          <Breadcrumb separator="bullet">
            <BreadcrumbItem href="#">Home</BreadcrumbItem>
            <BreadcrumbItem href="#">Docs</BreadcrumbItem>
            <BreadcrumbItem active>Bullet •</BreadcrumbItem>
          </Breadcrumb>

          <Breadcrumb separator="succeeds">
            <BreadcrumbItem href="#">Home</BreadcrumbItem>
            <BreadcrumbItem href="#">Docs</BreadcrumbItem>
            <BreadcrumbItem active>Succeeds »</BreadcrumbItem>
          </Breadcrumb>

          <Breadcrumb size="sm">
            <BreadcrumbItem href="#">Home</BreadcrumbItem>
            <BreadcrumbItem active>Small</BreadcrumbItem>
          </Breadcrumb>

          <Breadcrumb size="lg">
            <BreadcrumbItem href="#">Home</BreadcrumbItem>
            <BreadcrumbItem active>Large</BreadcrumbItem>
          </Breadcrumb>

          <Breadcrumb alignment="center">
            <BreadcrumbItem href="#">Center</BreadcrumbItem>
            <BreadcrumbItem active>Item</BreadcrumbItem>
          </Breadcrumb>

          <Breadcrumb alignment="right">
            <BreadcrumbItem href="#">Right</BreadcrumbItem>
            <BreadcrumbItem active>Item</BreadcrumbItem>
          </Breadcrumb>
        </section>
      </main>
    </>
  );
}
