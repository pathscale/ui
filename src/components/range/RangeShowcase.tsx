import Range from "./Range";

const RangeShowcase = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <Range />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">With Steps</h2>
        <Range min={0} max={100} step={25} displayTicks />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Colors</h2>
        <div class="flex flex-col gap-2">
          <Range value={20} color="primary" />
          <Range value={30} color="secondary" />
          <Range value={40} color="accent" />
          <Range value={50} color="success" />
          <Range value={60} color="warning" />
          <Range value={70} color="info" />
          <Range value={80} color="error" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Sizes</h2>
        <div class="flex flex-col gap-2">
          <Range value={40} size="xs" />
          <Range value={50} size="sm" />
          <Range value={60} size="md" />
          <Range value={70} size="lg" />
        </div>
      </section>
    </div>
  );
};

export default RangeShowcase;
