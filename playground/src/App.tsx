import { createSignal } from "solid-js";

import {
  Switch,
  Tooltip,
  Button,
  Navbar,
  NavbarItem,
  NavbarDropdown,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "../../src/";

export default function App() {
  const sizes = ["sm", "md", "lg"] as const;
  const switchColors = [
    "primary",
    "success",
    "danger",
    "warning",
    "gray",
  ] as const;

  const [controlledValue, setControlledValue] = createSignal(false);

  const triggers = ["click", "hover"] as const;
  const dropdownColors = ["primary", "secondary", "default"] as const;
  const sampleItems = (
    <>
      <DropdownItem>Option 1</DropdownItem>
      <DropdownItem>Option 2</DropdownItem>
      <DropdownItem>Option 3</DropdownItem>
    </>
  );

  return (
    <main class="min-h-screen">
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold border-b pb-2 mb-4">Switch</h2>
          <div class="space-y-6">
            <div class="flex flex-col gap-4">
              {sizes.map((size) => (
                <div class="flex items-center gap-4">
                  <Switch size={size}>Size {size}</Switch>
                  <Switch size={size} defaultChecked>
                    Size {size} (checked)
                  </Switch>
                </div>
              ))}
            </div>

            <div class="flex flex-col gap-4">
              {switchColors.map((color) => (
                <div class="flex items-center gap-4">
                  <Switch color={color} passiveColor={color}>
                    {color} switch
                  </Switch>
                  <Switch color={color} passiveColor={color} defaultChecked>
                    {color} switch (checked)
                  </Switch>
                </div>
              ))}
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-4">
                <Switch rounded>Rounded switch</Switch>
                <Switch rounded={false}>Square switch</Switch>
              </div>
              <div class="flex items-center gap-4">
                <Switch outlined>Outlined switch</Switch>
                <Switch outlined rounded={false}>
                  Outlined square switch
                </Switch>
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-4">
                <Switch disabled>Disabled switch</Switch>
                <Switch disabled defaultChecked>
                  Disabled checked switch
                </Switch>
              </div>
              <div class="flex items-center gap-4">
                <Switch required color="danger">
                  Required switch
                </Switch>
                <Switch name="switch-name">Named switch</Switch>
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-4">
                <Switch
                  checked={controlledValue()}
                  onChange={setControlledValue}
                >
                  Controlled switch
                </Switch>
                <span class="text-sm text-gray-500">
                  Value: {controlledValue() ? "On" : "Off"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold border-b pb-2 mb-4">Tooltip</h2>
          <div class="space-y-6">
            <div class="flex flex-wrap gap-4 items-center">
              <Tooltip
                label={`This is a multiline 
                tooltip example 
                with three lines of text`}
                multilined
              >
                <Button size="sm">Multiline</Button>
              </Tooltip>
              <Tooltip
                label="Single line will truncate if it's too long to fit in the available space"
                multilined={false}
              >
                <Button size="sm">Single line</Button>
              </Tooltip>
            </div>
          </div>
        </div>
        <div class="rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold border-b pb-2 mb-4">Navbar</h2>
          <div class="space-y-8">
            <Navbar color="primary" modelValue="Home">
              <NavbarItem label="Home">Home</NavbarItem>
              <NavbarItem label="About">About</NavbarItem>
              <NavbarItem label="Contact">Contact</NavbarItem>
            </Navbar>

            <Navbar color="success" modelValue="Contact" spaced shadow>
              <NavbarItem label="Home">Home</NavbarItem>
              <NavbarItem label="Services">Services</NavbarItem>
              <NavbarItem label="Contact">Contact</NavbarItem>
            </Navbar>

            <Navbar color="danger" modelValue="Services" shadow>
              <NavbarItem label="Overview">Overview</NavbarItem>
              <NavbarItem label="Services">Services</NavbarItem>
              <NavbarItem label="Support">Support</NavbarItem>
            </Navbar>

            <Navbar color="primary" spaced modelValue="Home">
              <NavbarItem label="Home">Home</NavbarItem>
              <NavbarDropdown label="Products" hoverable>
                <div class="p-2 space-y-1">
                  <NavbarItem label="Product A" color="light">
                    Product A
                  </NavbarItem>
                  <NavbarItem label="Product B" color="light">
                    Product B
                  </NavbarItem>
                </div>
              </NavbarDropdown>
              <NavbarDropdown label="Resources" hoverable align="right">
                <div class="p-2 space-y-1">
                  <NavbarItem label="Docs" color="light">
                    Docs
                  </NavbarItem>
                  <NavbarItem label="API" color="light">
                    API
                  </NavbarItem>
                </div>
              </NavbarDropdown>
            </Navbar>

            <Navbar color="light" spaced>
              <NavbarItem label="Home">Home</NavbarItem>
              <NavbarItem label="Blog">Blog</NavbarItem>
              <NavbarItem label="Login">Login</NavbarItem>
            </Navbar>
          </div>
        </div>
        <div class="rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold border-b pb-2 mb-4">Dropdown</h2>
          <div class="space-y-6">
            <div class="flex flex-wrap gap-4">
              <Dropdown>
                <DropdownTrigger>
                  <Button color="primary" variant="fill">
                    Click Trigger
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem>Profile</DropdownItem>
                  <DropdownItem>Settings</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown hoverable>
                <DropdownTrigger>
                  <Button color="positive" variant="fill">
                    Hover Trigger
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem>Hover 1</DropdownItem>
                  <DropdownItem>Hover 2</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <div class="flex flex-wrap gap-4">
              <Dropdown position="top-left">
                <DropdownTrigger>
                  <Button color="primary" variant="fill">
                    Top Left
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem>Item</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown position="top-right">
                <DropdownTrigger>
                  <Button color="primary" variant="fill">
                    Top Right
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem>Item</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown position="right">
                <DropdownTrigger>
                  <Button color="primary" variant="fill">
                    Right
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem>Item</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown position="left">
                <DropdownTrigger>
                  <Button color="primary" variant="fill">
                    Left
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem>Item</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <div class="flex flex-wrap gap-4">
              <Dropdown disabled>
                <DropdownTrigger>
                  <Button color="destructive" variant="fill">
                    Disabled
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem>Item</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <div class="flex flex-wrap gap-4">
              <Dropdown>
                <DropdownTrigger>
                  <Button color="primary" variant="fill">
                    With Links
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem>
                    <a
                      href="https://example.com"
                      class="text-blue-600 hover:underline"
                      target="_blank"
                    >
                      External Link
                    </a>
                  </DropdownItem>
                  <DropdownItem>
                    <a href="/profile" class="text-blue-600 hover:underline">
                      Internal Link
                    </a>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
