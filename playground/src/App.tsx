import Background from "../../src/components/background";
import Flex from "../../src/components/flex/Flex";
import Dropdown from "../../src/components/dropdown/Dropdown";
import DropdownItem from "../../src/components/dropdown/DropdownItem";
import DropdownToggle from "../../src/components/dropdown/DropdownToggle";
import DropdownMenu from "@src/components/dropdown/DropdownMenu";

export default function App() {
  return (
    <Background>
      <Flex class="min-h-screen">
        <main class="flex-1 p-8 space-y-16 scroll-smooth">
          <Dropdown
            class="dropdown-end dropdown-top"
          >
            <DropdownToggle>Click me</DropdownToggle>
            <DropdownMenu>
              <DropdownItem>Hello</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </main>
      </Flex>
    </Background>
  );
}
