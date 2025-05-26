import Field from "./Field";
import Input from "../input/Input";

const FieldShowcase = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Basic Usage</h2>
        <div class="space-y-4 max-w-md">
          <Field label="Username">
            <Input placeholder="Enter username" />
          </Field>

          <Field label="Email" message="We'll never share your email">
            <Input type="email" placeholder="Enter email" />
          </Field>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Sizes</h2>
        <div class="space-y-4 max-w-md">
          <Field label="Small field" size="sm">
            <Input size="sm" placeholder="Small input" />
          </Field>

          <Field label="Medium field" size="md">
            <Input size="md" placeholder="Medium input" />
          </Field>

          <Field label="Large field" size="lg">
            <Input size="lg" placeholder="Large input" />
          </Field>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Types</h2>
        <div class="space-y-4 max-w-md">
          <Field
            label="Default type field"
            type="default"
            message="Helper message"
          >
            <Input placeholder="Default input" />
          </Field>

          <Field
            label="Danger type field"
            type="danger"
            message="This field has an error"
          >
            <Input placeholder="Error input" color="danger" />
          </Field>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Layouts</h2>
        <div class="space-y-4 max-w-2xl">
          <Field label="Vertical (default)">
            <Input placeholder="Default layout" />
          </Field>

          <Field label="Horizontal" horizontal>
            <Input placeholder="Horizontal layout" />
          </Field>

          <Field label="Grouped controls" grouped>
            <Input placeholder="First name" />
            <Input placeholder="Last name" />
          </Field>

          <Field label="Grouped multiline" grouped groupMultiline>
            <Input placeholder="Street" />
            <Input placeholder="City" />
            <Input placeholder="State" />
            <Input placeholder="ZIP" />
          </Field>
        </div>
      </section>
    </div>
  );
};

export default FieldShowcase;
