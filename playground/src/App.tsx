import Background from "../../src/components/background";
import Flex from "../../src/components/flex/Flex";
import Dropdown from "../../src/components/dropdown/Dropdown";
import DropdownItem from "../../src/components/dropdown/DropdownItem";
import DropdownToggle from "../../src/components/dropdown/DropdownToggle";
import DropdownMenu from "@src/components/dropdown/DropdownMenu";
import { createSignal } from "solid-js";
import Button from "@src/components/button/Button";

export default function App() {
  const [open, setOpen] = createSignal(false);

  return (
    <Background>
      <Flex class="min-h-screen">
        <main class="flex-1 p-8 space-y-16 scroll-smooth">
          <Background dataTheme="light">
            <Flex>
              <Button>Click me</Button>
            </Flex>
          </Background>
        </main>
      </Flex>
    </Background>
  );
}
