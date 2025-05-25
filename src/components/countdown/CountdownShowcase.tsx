import { createSignal, onCleanup } from "solid-js";

import Countdown from "./Countdown";

export default function CountdownShowcase() {
  const [value, setValue] = createSignal(50);
  const [clockValue, setClockValue] = createSignal(34);
  const [labelValue, setLabelValue] = createSignal(37);
  const [boxValue, setBoxValue] = createSignal(26);

  const timer1 = setInterval(() => {
    setValue((v) => (v <= 0 ? 50 : v - 1));
  }, 1000);

  const timer2 = setInterval(() => {
    setClockValue((v) => (v <= 0 ? 34 : v - 1));
  }, 1000);

  const timer3 = setInterval(() => {
    setLabelValue((v) => (v <= 0 ? 37 : v - 1));
  }, 1000);

  const timer4 = setInterval(() => {
    setBoxValue((v) => (v <= 0 ? 26 : v - 1));
  }, 1000);

  onCleanup(() => {
    clearInterval(timer1);
    clearInterval(timer2);
    clearInterval(timer3);
    clearInterval(timer4);
  });

  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <Countdown class="text-2xl" value={value()} />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Clock</h2>
        <span class="font-mono text-2xl">
          <Countdown value={10} />:
          <Countdown value={24} />:
          <Countdown value={clockValue()} />
        </span>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">With Labels</h2>
        <div class="grid grid-flow-col gap-5 text-center auto-cols-max">
          <div class="flex flex-col">
            <Countdown class="font-mono text-5xl" value={15} />
            days
          </div>
          <div class="flex flex-col">
            <Countdown class="font-mono text-5xl" value={10} />
            hours
          </div>
          <div class="flex flex-col">
            <Countdown class="font-mono text-5xl" value={24} />
            min
          </div>
          <div class="flex flex-col">
            <Countdown class="font-mono text-5xl" value={labelValue()} />
            sec
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">With Boxes</h2>
        <div class="grid grid-flow-col gap-5 text-center auto-cols-max">
          <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
            <Countdown class="font-mono text-5xl" value={15} />
            days
          </div>
          <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
            <Countdown class="font-mono text-5xl" value={10} />
            hours
          </div>
          <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
            <Countdown class="font-mono text-5xl" value={24} />
            min
          </div>
          <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
            <Countdown class="font-mono text-5xl" value={boxValue()} />
            sec
          </div>
        </div>
      </section>
    </div>
  );
}
