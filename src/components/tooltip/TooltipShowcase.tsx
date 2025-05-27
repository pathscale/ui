import type { Component } from "solid-js";
import Tooltip from "./Tooltip";

const TooltipShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Basic Tooltip</h2>
        <Tooltip message="Hello!">
          <button class="btn">Hover me</button>
        </Tooltip>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Tooltip Positions
        </h2>
        <div class="flex flex-wrap gap-4 items-center">
          <Tooltip message="Top" position="top">
            <button class="btn">Top</button>
          </Tooltip>
          <Tooltip message="Bottom" position="bottom">
            <button class="btn">Bottom</button>
          </Tooltip>
          <Tooltip message="Left" position="left">
            <button class="btn">Left</button>
          </Tooltip>
          <Tooltip message="Right" position="right">
            <button class="btn">Right</button>
          </Tooltip>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Brand Colors</h2>
        <div class="flex flex-wrap gap-4 items-center">
          <Tooltip message="Primary" color="primary">
            <button class="btn">Primary</button>
          </Tooltip>
          <Tooltip message="Secondary" color="secondary">
            <button class="btn">Secondary</button>
          </Tooltip>
          <Tooltip message="Accent" color="accent">
            <button class="btn">Accent</button>
          </Tooltip>
          <Tooltip message="Info" color="info">
            <button class="btn">Info</button>
          </Tooltip>
          <Tooltip message="Success" color="success">
            <button class="btn">Success</button>
          </Tooltip>
          <Tooltip message="Warning" color="warning">
            <button class="btn">Warning</button>
          </Tooltip>
          <Tooltip message="Error" color="error">
            <button class="btn">Error</button>
          </Tooltip>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Always Visible</h2>
        <Tooltip message="I'm always visible" open>
          <button class="btn">Static</button>
        </Tooltip>
      </section>
    </div>
  );
};

export default TooltipShowcase;
