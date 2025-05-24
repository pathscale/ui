import { Dropdown } from "./Dropdown";

export default function DropdownShowcase() {
  return (
    <div class="min-h-screen flex items-center justify-center bg-base-200">
        <Dropdown.Menu class="w-52">
          <Dropdown.Item>Item 1</Dropdown.Item>
          <Dropdown.Item>Item 2</Dropdown.Item>
        </Dropdown.Menu>
    </div>
  );
}
