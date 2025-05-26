import Dropdown from "./Dropdown";
import DropdownTrigger from "./DropdownTrigger";
import DropdownMenu from "./DropdownMenu";
import DropdownItem from "./DropdownItem";
import Button from "../button/";

const DropdownShowcase = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Triggers</h2>
        <div class="flex flex-wrap gap-4">
          <Dropdown>
            <DropdownTrigger>
              <Button color="primary">Click trigger</Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem>Option 1</DropdownItem>
              <DropdownItem>Option 2</DropdownItem>
              <DropdownItem>Option 3</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Dropdown hoverable>
            <DropdownTrigger>
              <Button color="success">Hover trigger</Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem>Hover A</DropdownItem>
              <DropdownItem>Hover B</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Disabled</h2>
        <div class="flex gap-4">
          <Dropdown disabled>
            <DropdownTrigger>
              <Button color="primary" disabled>
                Can't open
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem>Hidden</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Alignment</h2>
        <div class="flex flex-wrap gap-4">
          <Dropdown position="left">
            <DropdownTrigger>
              <Button>Left</Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem>Left A</DropdownItem>
              <DropdownItem>Left B</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Dropdown position="right">
            <DropdownTrigger>
              <Button>Right</Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem>Right A</DropdownItem>
              <DropdownItem>Right B</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Dropdown position="top-left">
            <DropdownTrigger>
              <Button>Top Left</Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem>Top A</DropdownItem>
              <DropdownItem>Top B</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Dropdown position="top-right">
            <DropdownTrigger>
              <Button>Top Right</Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem>Top A</DropdownItem>
              <DropdownItem>Top B</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </section>
    </div>
  );
};

export default DropdownShowcase;
