import { type Component } from "solid-js";
import Alert from "./Alert";
import Button from "../button/Button";

const AlertShowcase: Component = () => {
  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      class="stroke-current shrink-0 w-6 h-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Basic</h2>
        <Alert icon={icon}>12 unread messages. Tap to see.</Alert>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Status Colors</h2>
        <div class="space-y-2">
          <Alert status="info" icon={icon}>
            New software update available.
          </Alert>
          <Alert status="success" icon={icon}>
            Your purchase has been confirmed!
          </Alert>
          <Alert status="warning" icon={icon}>
            Warning: Invalid email address!
          </Alert>
          <Alert status="error" icon={icon}>
            Error! Task failed successfully.
          </Alert>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Variants</h2>
        <div class="space-y-2">
          <Alert status="info" variant="soft" class="w-full">
            Soft style info alert
          </Alert>
          <Alert status="success" variant="outline" class="w-full">
            Outline style success alert
          </Alert>
          <Alert status="error" variant="dash" class="w-full">
            Dash style error alert
          </Alert>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">With Actions</h2>
        <Alert icon={icon}>
          <span>We use cookies for no reason.</span>
          <div class="space-x-1">
            <Button size="sm">Deny</Button>
            <Button size="sm" color="primary">
              Accept
            </Button>
          </div>
        </Alert>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Title and Description
        </h2>
        <Alert icon={icon} class="shadow-lg">
          <div>
            <h3 class="font-bold">New message!</h3>
            <div class="text-xs">You have 1 unread message</div>
          </div>
          <Button size="sm">See</Button>
        </Alert>
      </section>
    </div>
  );
};

export default AlertShowcase;
