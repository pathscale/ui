import Background from "../../src/components/background";
import Flex from "../../src/components/flex/Flex";
import Dropdown from "../../src/components/dropdown/Dropdown";
import DropdownItem from "../../src/components/dropdown/DropdownItem";
import DropdownToggle from "../../src/components/dropdown/DropdownToggle";
import DropdownMenu from "@src/components/dropdown/DropdownMenu";
import { createSignal } from "solid-js";

export default function App() {
  const [open, setOpen] = createSignal(false);

  return (
    <Background>
      <Flex class="min-h-screen">
        <main class="flex-1 p-8 space-y-16 scroll-smooth">
          <p>{open() ? "Open" : "Closed"}</p>
          <Dropdown>
            <DropdownToggle>Click me</DropdownToggle>
            <DropdownMenu>
              <DropdownItem closeOnClick={false} onClick={() => setOpen(!open())}>
                Hello
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </main>
      </Flex>
    </Background>
  );
}
