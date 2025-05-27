// components/dropdown/Dropdown.stories.tsx
import Dropdown from ".";

const DropdownShocase = () => {
  return (
    <section>
      <h2 class="text-xl font-semibold border-b pb-2 mb-4">Dropdown Basic</h2>
      <div class="my-32">
        <Dropdown>
          <Dropdown.Toggle>Click</Dropdown.Toggle>
          <Dropdown.Menu class="w-52">
            <Dropdown.Item>Item 1</Dropdown.Item>
            <Dropdown.Item>Item 2</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </section>
  );
};

export default DropdownShocase