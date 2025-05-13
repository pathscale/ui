import { type Component } from "solid-js";
import { Percent, Value, Sizes, Colors } from "./index";

const Progress: Component = () => {
  return (
    <section>
      <div class="p-4">
        <h1 class="text-2xl font-semibold mb-4">Progress Component Demo</h1>
        <Value value={40} size="sm" shape="circle" variant="filled" />
        <Value value={70} size="md" shape="rounded" variant="outlined" />
        <Value value={90} size="lg" shape="circle" variant="ghost" />
      </div>
      <div class="mt-4 flex flex-col gap-4">
        <Sizes value={20} size="sm" />
        <Sizes value={30} size="md" />
        <Sizes value={50} size="lg" />
      </div>
      <div class="mt-4">
        <Percent value={80} showValue format="percent" />
      </div>
      <div class="mt-4 flex flex-col gap-4">
        <Colors value={40} color="danger" />
        <Colors value={60} color="success" />
        <Colors value={80} color="info" />
        <Colors value={100} color="warning" />
      </div>
    </section>

  );
};

export default Progress;