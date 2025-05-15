import { createSignal, For } from "solid-js";

import Button, { type ButtonVariantProps } from "../../src/components/button";
import Input from "../../src/components/input";
import Textarea from "../../src/components/textarea";
import { Breadcrumb, BreadcrumbItem } from "../../src/components/breadcrumb";
import Switch from "../../src/components/switch";
import Tag from "../../src/components/tag";
import Checkbox from "../../src/components/checkbox";
import Select from "../../src/components/select";
import Pagination from "../../src/components/pagination";
import Accordion from "../../src/components/accordion";
import Tabs from "../../src/components/tabs";
import Upload from "../../src/components/upload";
import Avatar from "../../src/components/Avatar";
import Progress from "../../src/components/Progress";
import Tooltip from "../../src/components/tooltip";
import Steps, { type StepItem } from "../../src/components/steps";
import { inputVariants } from "../../src/components/input/Input.styles";
import { Menu, MenuItem, MenuList } from "../../src/components/menu";
import Table, { type Column } from "../../src/components/table/index";
import { Dropdown, DropdownItem } from "../../src/components/Dropdown/index";
import {
  Navbar,
  NavbarItem,
  NavbarDropdown,
} from "../../src/components/navbar";
import { imageStyles } from "../../src/components/navbar/Navbar.styles";

export default function App() {
  const [color, setColor] =
    createSignal<ButtonVariantProps["color"]>("primary");

  // steps data:
  const [data, setData] = createSignal({
    name: "",
    email: "",
  });

  const steps: StepItem[] = [
    {
      title: "Contact",
      marker: "1",
      content: (
        <>
          <div>
            <label>Name</label>
            <input
              class={inputVariants()}
              value={data().name}
              onInput={(e) =>
                setData({ ...data(), name: e.currentTarget.value })
              }
            />
          </div>
          <div>
            <label>Email</label>
            <input
              class={inputVariants()}
              type="email"
              maxlength="30"
              value={data().email}
              onInput={(e) =>
                setData({ ...data(), email: e.currentTarget.value })
              }
            />
          </div>
        </>
      ),
    },
    {
      title: "Account",
      marker: "2",
      subtitle: "You can click me",
      clickable: true,
      content: <div>Account form…</div>,
    },
    {
      title: "Recovery",
      marker: "3",
      content: <div>Recovery form…</div>,
    },
    {
      title: "Finish",
      marker: "4",
      content: <div>Done!</div>,
    },
  ];

  const [username, setUsername] = createSignal("the_boogeyman");
  const [password, setPassword] = createSignal("Daisy");
  const [files, setFiles] = createSignal<File[]>([]);

  const handleChange = (selected: File | File[]) => {
    const list = Array.isArray(selected) ? selected : [selected];
    setFiles(list);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const [formData, setFormData] = createSignal({
    name: "John Wick",
    email: "boogeyman@gmail.com",
    username: "the_boogeyman",
    password: "Daisy",
    message: "Guns. Lots of guns.",
    amount: 0,
  });

  // Table handlers:
  type Person = {
    id: number;
    name: string;
    age: number;
  };

  const columns: Column<Person>[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "name", header: "Name", sortable: true },
    { key: "age", header: "Age", sortable: true },
  ];

  const [rows, setRows] = createSignal<Person[]>([
    { id: 1, name: "Alice", age: 30 },
    { id: 2, name: "Bob", age: 24 },
    { id: 3, name: "Carol", age: 29 },
  ]);

  const onSort = (key: keyof Person, direction: "asc" | "desc") => {
    const sorted = [...rows()].sort((a, b) => {
      const aVal = a[key]!;
      const bVal = b[key]!;
      if (aVal === bVal) return 0;
      return direction === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
        ? 1
        : -1;
    });
    setRows(sorted);
  };
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
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Pagination
          </h2>
          <div class="space-y-2">
            <h3 class="font-medium">Default</h3>
            {(() => {
              const [page, setPage] = createSignal(5);
              return (
                <Pagination total={100} current={page()} onChange={setPage} />
              );
            })()}
          </div>

          <div class="space-y-2">
            <h3 class="font-medium">Sizes</h3>
            <div class="flex gap-4">
              {(() => {
                const [page, setPage] = createSignal(2);
                return (
                  <Pagination
                    total={50}
                    current={page()}
                    size="sm"
                    onChange={setPage}
                  />
                );
              })()}
              {(() => {
                const [page, setPage] = createSignal(2);
                return (
                  <Pagination
                    total={50}
                    current={page()}
                    size="md"
                    onChange={setPage}
                  />
                );
              })()}
              {(() => {
                const [page, setPage] = createSignal(2);
                return (
                  <Pagination
                    total={50}
                    current={page()}
                    size="lg"
                    onChange={setPage}
                  />
                );
              })()}
            </div>
          </div>

          <div class="space-y-2">
            <h3 class="font-medium">Rounded</h3>
            {(() => {
              const [page, setPage] = createSignal(3);
              return (
                <Pagination
                  total={80}
                  current={page()}
                  onChange={setPage}
                  rounded
                />
              );
            })()}
          </div>

          <div class="space-y-2">
            <h3 class="font-medium">Simple</h3>
            {(() => {
              const [page, setPage] = createSignal(6);
              return (
                <Pagination
                  total={200}
                  current={page()}
                  simple
                  onChange={setPage}
                />
              );
            })()}
          </div>

          <div class="space-y-2">
            <h3 class="font-medium">Custom rangeBefore / rangeAfter</h3>
            {(() => {
              const [page, setPage] = createSignal(8);
              return (
                <Pagination
                  total={150}
                  current={page()}
                  rangeBefore={2}
                  rangeAfter={3}
                  onChange={setPage}
                />
              );
            })()}
          </div>

          <div class="space-y-2">
            <h3 class="font-medium">Single page (hidden nav)</h3>
            {(() => {
              const [page, setPage] = createSignal(1);
              return (
                <Pagination total={10} current={page()} onChange={setPage} />
              );
            })()}
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Accordion
          </h2>
          <div class="space-y-2">
            <Accordion
              headerIsTrigger
              header={
                <div class="py-2 px-3 font-medium text-red-600">Click me</div>
              }
              content={<div class="py-2 px-3">Content goes here</div>}
            />

            <Accordion
              expanded
              headerIsTrigger
              header={
                <div class="py-2 px-3 font-medium text-blue-600">
                  Expanded by default
                </div>
              }
              content={
                <div class="py-2 px-3">This panel is open by default</div>
              }
            />

            <Accordion
              disabled
              headerIsTrigger
              header={
                <div class="py-2 px-3 text-gray-500">Disabled Accordion</div>
              }
              content={<div class="py-2 px-3">You can't toggle this</div>}
            />
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Tabs
          </h2>
          <div class="grid grid-cols-2 gap-3">
            {(() => {
              const [active, setActive] = createSignal(0);

              return (
                <Tabs
                  value={active()}
                  onChange={setActive}
                  items={[
                    {
                      label: "Overview",
                      content: <p>This is the overview section.</p>,
                    },
                    {
                      label: "Details",
                      content: <p>This is the details section.</p>,
                    },
                    {
                      label: "Stats",
                      content: <p>This is the stats section.</p>,
                    },
                    {
                      label: "Disabled",
                      content: <p>Should not activate.</p>,
                      disabled: true,
                    },
                  ]}
                />
              );
            })()}

            <Tabs
              size="sm"
              items={[
                { label: "Small A", content: <p>Small A content</p> },
                { label: "Small B", content: <p>Small B content</p> },
              ]}
            />
            <Tabs
              size="lg"
              items={[
                { label: "Large A", content: <p>Large A content</p> },
                { label: "Large B", content: <p>Large B content</p> },
              ]}
            />

            <Tabs
              type="boxed"
              items={[
                { label: "Boxed 1", content: <p>Boxed tab 1</p> },
                { label: "Boxed 2", content: <p>Boxed tab 2</p> },
              ]}
            />
            <Tabs
              type="toggle"
              items={[
                { label: "Toggle 1", content: <p>Toggle tab 1</p> },
                { label: "Toggle 2", content: <p>Toggle tab 2</p> },
              ]}
            />
            <Tabs
              type="toggle-rounded"
              items={[
                { label: "Rounded 1", content: <p>Rounded tab 1</p> },
                { label: "Rounded 2", content: <p>Rounded tab 2</p> },
              ]}
            />

            <Tabs
              alignment="center"
              items={[
                { label: "Center A", content: <p>Center A content</p> },
                { label: "Center B", content: <p>Center B content</p> },
              ]}
            />
            <Tabs
              alignment="right"
              items={[
                { label: "Right A", content: <p>Right A content</p> },
                { label: "Right B", content: <p>Right B content</p> },
              ]}
            />
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Upload
          </h2>
          <div class="grid grid-cols-2 gap-3">
            <Upload
              style="boxed"
              label="Choose a file…"
              multiple
              expanded
              icon={
                <svg
                  class="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              }
              onChange={handleChange}
            />

            <div class="grid grid-cols-2 gap-3">
              {(["success", "info", "warning", "danger"] as const).map(
                (color) => (
                  <Upload
                    style="button"
                    color={color}
                    label={`Upload ${color}`}
                    icon={
                      <svg
                        class="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    }
                    onChange={handleChange}
                  />
                )
              )}
            </div>

            <div class="grid grid-cols-2 gap-3">
              <Upload
                style="button"
                size="sm"
                color="info"
                label="Small"
                icon={
                  <svg
                    class="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                }
                onChange={handleChange}
              />
              <Upload
                style="button"
                size="md"
                color="info"
                label="Medium"
                icon={
                  <svg
                    class="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                }
                onChange={handleChange}
              />
              <Upload
                style="button"
                size="lg"
                color="info"
                label="Large"
                icon={
                  <svg
                    class="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                }
                onChange={handleChange}
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <For each={files()}>
                {(file, index) => (
                  <div class="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                    <span class="truncate max-w-[160px]">{file.name}</span>
                    <button
                      onClick={() => removeFile(index())}
                      class="ml-2 text-blue-500 hover:text-blue-700 font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Menu
          </h2>
          <Menu>
            <MenuList label="Menu">
              <MenuItem label="Info" />
              <MenuItem label="Administrator" active expanded>
                <MenuItem label="Users" />
                <MenuItem label="Devices" />
                <MenuItem label="Payments" disabled />
              </MenuItem>
              <MenuItem label="My Account">
                <MenuItem label="Account data" />
                <MenuItem label="Addresses" />
              </MenuItem>
            </MenuList>
            <MenuList>
              <MenuItem label="Expo" tag="a" to="/" target="_blank" />
            </MenuList>
            <MenuList label="Actions">
              <MenuItem label="Logout" />
            </MenuList>
          </Menu>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Steps
          </h2>
          <Steps
            animated
            initial={0}
            steps={[
              {
                title: "Contact",
                marker: "1",
                content: (
                  <>
                    <div>
                      <label>Name</label>
                      <input
                        class={inputVariants()}
                        value={formData().name}
                        onInput={(e) =>
                          setFormData({
                            ...formData(),
                            name: e.currentTarget.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label>Email</label>
                      <input
                        class={inputVariants()}
                        value={formData().email}
                        onInput={(e) =>
                          setFormData({
                            ...formData(),
                            email: e.currentTarget.value,
                          })
                        }
                        type="email"
                        maxlength="30"
                      />
                    </div>
                  </>
                ),
              },
              {
                title: "Account",
                marker: "2",
                subtitle: "You can click me",
                content: (
                  <>
                    <div>
                      <label>Username</label>
                      <input
                        class={inputVariants()}
                        value={formData().username}
                        onInput={(e) =>
                          setFormData({
                            ...formData(),
                            username: e.currentTarget.value,
                          })
                        }
                        maxlength="30"
                      />
                    </div>
                    <div>
                      <label>Password</label>
                      <input
                        class={inputVariants()}
                        type="password"
                        value={formData().password}
                        onInput={(e) =>
                          setFormData({
                            ...formData(),
                            password: e.currentTarget.value,
                          })
                        }
                      />
                    </div>
                  </>
                ),
              },
              {
                title: "Recovery",
                marker: "3",
                content: (
                  <>
                    <div>
                      <label>Recovery passphrase</label>
                      <textarea
                        class={inputVariants()}
                        maxlength="144"
                        value={formData().message}
                        onInput={(e) =>
                          setFormData({
                            ...formData(),
                            message: e.currentTarget.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label>Amount</label>
                      <input
                        class={inputVariants()}
                        type="number"
                        min="0"
                        value={formData().amount}
                        onInput={(e) =>
                          setFormData({
                            ...formData(),
                            amount: +e.currentTarget.value,
                          })
                        }
                      />
                    </div>
                  </>
                ),
              },
              {
                title: "Finish",
                class: "centered",
                content: (
                  <h1 class="text-lg font-bold">
                    Your account is now created!
                  </h1>
                ),
              },
            ]}
          />
          <h1>Step variant 2</h1>
          <Steps animated initial={0} steps={steps} />
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Dropdown
          </h2>
          <Dropdown
            label="Click me"
            trigger="click"
            position="bottom-left"
            color="default"
          >
            <DropdownItem>Blue</DropdownItem>
            <DropdownItem>Green</DropdownItem>
          </Dropdown>

          <Dropdown
            label="Up/Left"
            trigger="click"
            position="top-left"
            color="secondary"
          >
            <DropdownItem>Pidgey</DropdownItem>
            <DropdownItem>Meowth</DropdownItem>
          </Dropdown>

          <Dropdown label="Hover Up/Right" trigger="hover" position="top-right">
            <DropdownItem hasLink>
              <a
                href="https://google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Link to Google
              </a>
            </DropdownItem>
            <DropdownItem hasLink>
              <a
                href="https://solidjs.com"
                target="_blank"
                rel="noopener noreferrer"
              >
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
            <DropdownItem>This shouldn't open</DropdownItem>
          </Dropdown>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Navbar
          </h2>
          <Navbar
            color="info"
            brand={
              <NavbarItem tag="a" to="/navbar">
                <img
                  src="/logo.png"
                  alt="Logo"
                  class={imageStyles({
                    size: "lg",
                    rounded: true,
                    bordered: true,
                  })}
                />
              </NavbarItem>
            }
            start={
              <>
                <NavbarItem href="#" active>
                  Home
                </NavbarItem>
                <NavbarItem href="#">Documentation</NavbarItem>
                <NavbarDropdown label="Info" hoverable align="left">
                  <NavbarItem href="#" active>
                    About
                  </NavbarItem>
                  <NavbarItem href="#">Contact</NavbarItem>
                </NavbarDropdown>
              </>
            }
            end={
              <>
                <NavbarItem tag="div">
                  <button>Sign up</button>
                </NavbarItem>
                <NavbarItem tag="div">
                  <button>Log in</button>
                </NavbarItem>
              </>
            }
          />
        </div>
      </div>
    </main>
  );
}
