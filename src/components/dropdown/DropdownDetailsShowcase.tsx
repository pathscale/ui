// components/dropdown/Dropdown.stories.tsx
import Dropdown from ".";

const DropdownDetailsShocase = () => {
    return (
        <section>
            <h2 class="text-xl font-semibold border-b pb-2 mb-4">Dropdown Details</h2>
            <div class="my-32">
                <Dropdown.Details>
                    <Dropdown.Details.Toggle>Click</Dropdown.Details.Toggle>
                    <Dropdown.Menu className="w-52">
                        <Dropdown.Item>Item 1</Dropdown.Item>
                        <Dropdown.Item>Item 2</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown.Details>
            </div>
        </section>
    );
};

export default DropdownDetailsShocase
