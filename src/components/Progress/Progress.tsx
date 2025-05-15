import { type Component } from "solid-js";
import ProgressValue from "./ProgressValue";
import ProgressSizes from "./ProgressSizes";
import ProgressPercent from "./ProgressPercent";
import ProgressColors from "./ProgressColors";

const Progress: Component = () => {
  return (
    <section>
      <div class="p-4">
        <h1 class="text-2xl font-semibold mb-4">Progress Component Demo</h1>
        <ProgressValue value={40} size="sm" shape="circle" variant="filled" />
        <ProgressValue
          value={70}
          size="md"
          shape="rounded"
          variant="outlined"
        />
        <ProgressValue value={90} size="lg" shape="circle" variant="ghost" />
      </div>
      <div class="mt-4 flex flex-col gap-4">
        <ProgressSizes value={20} size="sm" />
        <ProgressSizes value={30} size="md" />
        <ProgressSizes value={50} size="lg" />
      </div>
      <div class="mt-4">
        <ProgressPercent value={80} showValue format="percent" />
      </div>
      <div class="mt-4 flex flex-col gap-4">
        <ProgressColors value={40} color="danger" />
        <ProgressColors value={60} color="success" />
        <ProgressColors value={80} color="info" />
        <ProgressColors value={100} color="warning" />
      </div>
    </section>
  );
};

export default Progress;
