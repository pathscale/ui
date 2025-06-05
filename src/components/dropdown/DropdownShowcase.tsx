// components/dropdown/DropdownShowcase.tsx
import Dropdown from ".";

const DropdownShowcase = () => {
  return (
    <div class="space-y-8 p-4">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Dropdown Basic</h2>
        <div class="my-8">
          <Dropdown>
            <Dropdown.Toggle class="btn">Click</Dropdown.Toggle>
            <Dropdown.Menu class="w-52">
              <Dropdown.Item>Item 1</Dropdown.Item>
              <Dropdown.Item>Item 2</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          With Headers & Dividers
        </h2>
        <div class="my-8">
          <Dropdown>
            <Dropdown.Toggle class="btn">Advanced Content</Dropdown.Toggle>
            <Dropdown.Menu class="w-56">
              <Dropdown.Header>User Options</Dropdown.Header>
              <Dropdown.Item>Profile</Dropdown.Item>
              <Dropdown.Item>Settings</Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Header>System</Dropdown.Header>
              <Dropdown.Item>Help</Dropdown.Item>
              <Dropdown.Item>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Dropdown Positioning
        </h2>
        <div class="my-8 flex flex-wrap gap-4">
          <Dropdown horizontal="left">
            <Dropdown.Toggle class="btn">Left</Dropdown.Toggle>
            <Dropdown.Menu class="w-52">
              <Dropdown.Item>Item 1</Dropdown.Item>
              <Dropdown.Item>Item 2</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown horizontal="right">
            <Dropdown.Toggle class="btn">Right</Dropdown.Toggle>
            <Dropdown.Menu class="w-52">
              <Dropdown.Item>Item 1</Dropdown.Item>
              <Dropdown.Item>Item 2</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown vertical="top">
            <Dropdown.Toggle class="btn">Top</Dropdown.Toggle>
            <Dropdown.Menu class="w-52">
              <Dropdown.Item>Item 1</Dropdown.Item>
              <Dropdown.Item>Item 2</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Hover Dropdown</h2>
        <div class="my-8">
          <Dropdown hover>
            <Dropdown.Toggle class="btn">Hover Me</Dropdown.Toggle>
            <Dropdown.Menu class="w-52">
              <Dropdown.Item>Item 1</Dropdown.Item>
              <Dropdown.Item>Item 2</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </section>
    </div>
  );
};

export default DropdownShowcase;
