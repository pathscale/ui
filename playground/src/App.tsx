import Button, { type ButtonVariantProps } from "../../src/components/button";
import Input from "../../src/components/input";
import Textarea from "../../src/components/textarea";
import { Breadcrumb, BreadcrumbItem } from "../../src/components/breadcrumb";
import Switch from "../../src/components/switch";
import { createSignal } from "solid-js";
import Tag from "../../src/components/tag";
import Checkbox from "../../src/components/checkbox";
import Select from "../../src/components/select";
import Avatar from "../../src/components/Avatar";
import Progress from "../../src/components/Progress";
import Tooltip from "../../src/components/tooltip";
import { Dropdown, DropdownItem } from "../../src/components/Dropdown/index";

export default function App() {
  const [color, setColor] =
    createSignal<ButtonVariantProps["color"]>("primary");
  const [username, setUsername] = createSignal("the_boogeyman");
  const [password, setPassword] = createSignal("Daisy");

  return (
    <main class="min-h-screen bg-gray-50 p-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Button
          </h2>
          <div class="flex items-center gap-4">
            <Select
              placeholder="Select color"
              value={color()}
              onChange={(e: { currentTarget: { value: string } }) =>
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
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Input
          </h2>
          <div class="space-y-4">
            <Input
              value={username()}
              onInput={(e: { currentTarget: { value: string } }) =>
                setUsername(e.currentTarget.value)
              }
              placeholder="the_boogeyman"
            />
            <Input
              value={password()}
              onInput={(e: { currentTarget: { value: string } }) =>
                setPassword(e.currentTarget.value)
              }
              placeholder="Password"
              type="password"
              passwordReveal
              color="danger"
            />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Avatar
          </h2>
          <div class="flex gap-4">
            <Avatar
              alt="John Doe"
              shape="circle"
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
              dataSrc="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
            />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Progress
          </h2>
          <div class="flex gap-4">
            <Progress />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Textarea
          </h2>
          <Textarea
            placeholder="Write your thoughts..."
            color="primary"
            size="md"
            resize="y"
            hasCounter
            maxlength={144}
            value=""
            onInput={(e: { currentTarget: { value: string } }) =>
              console.log(e.currentTarget.value)
            }
          />
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Tooltip
          </h2>
          <div class="space-y-6">
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

            <div class="flex gap-4 flex-wrap items-center">
              <Tooltip label="Always visible" always position="right">
                <button class="bg-green-500 text-white px-3 py-1 rounded">
                  Always
                </button>
              </Tooltip>
            </div>

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
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Breadcrumb
          </h2>
          <div class="space-y-4">
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
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Switch
          </h2>
          <div class="space-y-6">
            <div class="space-y-3">
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
            <div class="flex gap-4">
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
            <div class="space-y-3">
              <Switch
                checked
                onChange={(val: boolean) => console.log("Switched to", val)}
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
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Tag
          </h2>
          <div class="space-y-4">
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
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Checkbox
          </h2>
          <div class="flex flex-col gap-3">
            <Checkbox
              label="Accept Terms"
              onChange={(e: { currentTarget: { checked: boolean } }) =>
                console.log("Checked:", e.currentTarget.checked)
              }
            />
            <Checkbox label="Indeterminate" indeterminate />
            <Checkbox label="Disabled checkbox" checked disabled />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Select
          </h2>
          <div class="grid grid-cols-2 gap-3">
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
            <Select
              placeholder="Expanded select"
              color="danger"
              expanded
              class="col-span-2"
            >
              <option value="expanded">Expanded</option>
            </Select>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
        <Dropdown label="Click me" trigger="click" position="bottom-left" color="default">
            <DropdownItem value="blue">Blue</DropdownItem>
            <DropdownItem value="green">Green</DropdownItem>
          </Dropdown>

          <Dropdown label="Up/Left" trigger="click" position="top-left" color="secondary">
            <DropdownItem value="pidgey">Pidgey</DropdownItem>
            <DropdownItem value="meowth">Meowth</DropdownItem>
          </Dropdown>

          <Dropdown label="Hover Up/Right" trigger="hover" position="top-right">
            <DropdownItem hasLink>
              <a href="https://google.com" target="_blank" rel="noopener noreferrer">
                Link to Google
              </a>
            </DropdownItem>
            <DropdownItem hasLink>
              <a href="https://solidjs.com" target="_blank" rel="noopener noreferrer">
                Link to Solid
              </a>
            </DropdownItem>
          </Dropdown>

          <Dropdown
            label="Can't click me"
            trigger="click"
            position="bottom-left"
            disabledLabel="I really can't!"
            disabled
          >
            <DropdownItem value="none">This shouldn't open</DropdownItem>
          </Dropdown>
        </div>
      </div>
    </main>
  );
}
