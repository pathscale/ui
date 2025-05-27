import Radio from "./Radio";

const RadioShowcase = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <div class="flex gap-4">
          <Radio name="radio1" checked />
          <Radio name="radio1" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Colors</h2>
        <div class="flex flex-col gap-2">
          <Radio color="primary" name="radio2" checked />
          <Radio color="secondary" name="radio2" checked />
          <Radio color="accent" name="radio2" checked />
          <Radio color="success" name="radio2" checked />
          <Radio color="warning" name="radio2" checked />
          <Radio color="info" name="radio2" checked />
          <Radio color="error" name="radio2" checked />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Disabled</h2>
        <div class="flex gap-4">
          <Radio name="radio3" disabled />
          <Radio name="radio3" disabled />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          With Labels and Form
        </h2>
        <div class="bg-base-200 w-full max-w-sm p-4 rounded-lg shadow space-y-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <Radio name="radio4" class="checked:bg-red-500" checked />
            <span>Red Pill</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <Radio name="radio4" class="checked:bg-blue-500" />
            <span>Blue Pill</span>
          </label>
        </div>
      </section>
    </div>
  );
};

export default RadioShowcase;
