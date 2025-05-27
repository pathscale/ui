import type { Component } from "solid-js";
import Progress from "./Progress";

const ProgressShowcase: Component = () => {
  return (
    <div class="space-y-8 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <div class="flex flex-col gap-2 w-56">
          <Progress max={100} value={0} />
          <Progress max={100} value={10} />
          <Progress max={100} value={40} />
          <Progress max={100} value={70} />
          <Progress max={100} value={100} />
        </div>
      </section>

      {[
        "primary",
        "secondary",
        "accent",
        "success",
        "info",
        "warning",
        "error",
      ].map((color) => (
        <section>
          <h2 class="text-xl font-semibold border-b pb-2 mb-4 capitalize">
            {color} Color
          </h2>
          <div class="flex flex-col gap-2 w-56">
            <Progress max={100} value={0} color={color as any} />
            <Progress max={100} value={10} color={color as any} />
            <Progress max={100} value={40} color={color as any} />
            <Progress max={100} value={70} color={color as any} />
            <Progress max={100} value={100} color={color as any} />
          </div>
        </section>
      ))}

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Indeterminate</h2>
        <div class="w-56">
          <Progress />
        </div>
      </section>
    </div>
  );
};

export default ProgressShowcase;
