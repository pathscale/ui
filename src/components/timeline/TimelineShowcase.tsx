import { type Component } from "solid-js";
import {
  Timeline,
  TimelineItem,
  TimelineStart,
  TimelineMiddle,
  TimelineEnd,
} from "./";

const DemoTimeline = (props: {
  vertical?: boolean;
  horizontal?: boolean;
  responsive?: boolean;
  compact?: boolean;
  snap?: boolean;
}) => (
  <Timeline {...props}>
    <TimelineItem connect="end">
      <TimelineStart box>Start</TimelineStart>
      <TimelineMiddle />
      <TimelineEnd>Step 1</TimelineEnd>
    </TimelineItem>

    <TimelineItem connect="both">
      <TimelineStart>Step 2</TimelineStart>
      <TimelineMiddle />
      <TimelineEnd>Processed</TimelineEnd>
    </TimelineItem>

    <TimelineItem connect="both">
      <TimelineStart box>Step 3</TimelineStart>
      <TimelineMiddle />
      <TimelineEnd box>Shipped</TimelineEnd>
    </TimelineItem>

    <TimelineItem connect="start">
      <TimelineStart>Final</TimelineStart>
      <TimelineMiddle />
      <TimelineEnd box>Delivered</TimelineEnd>
    </TimelineItem>
  </Timeline>
);

const TimelineShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Vertical Timeline
        </h2>
        <DemoTimeline vertical />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Horizontal Timeline
        </h2>
        <div class="overflow-x-auto">
          <DemoTimeline horizontal />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Responsive Timeline
        </h2>
        <div class="overflow-x-auto">
          <DemoTimeline responsive />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Compact Timeline
        </h2>
        <DemoTimeline vertical compact />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Snap Icon Timeline
        </h2>
        <DemoTimeline vertical snap />
      </section>
    </div>
  );
};

export default TimelineShowcase;
