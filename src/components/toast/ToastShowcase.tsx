import { type Component, createSignal } from "solid-js";
import Toast from "./Toast";
import Button from "../button/Button";

const ToastShowcase: Component = () => {
  const [alerts, setAlerts] = createSignal([
    { text: "This is a custom alert!", status: "info" },
  ]);

  const statuses = ["info", "success", "warning", "error"] as const;

  const addAlert = () => {
    setAlerts((prev) => [
      ...prev,
      {
        text: "New message arrived.",
        status: statuses[Math.floor(Math.random() * statuses.length)]!,
      },
    ]);
  };

  const removeAlert = (index: number) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Basic Toast</h2>
        <Toast>Default toast message.</Toast>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Toast with Alert
        </h2>
        <Toast>
          <div class="alert alert-info">
            <span>New message arrived.</span>
          </div>
        </Toast>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Multiple Alerts
        </h2>
        <Toast>
          <div class="alert alert-info">New message arrived.</div>
          <div class="alert alert-success">Message sent successfully.</div>
        </Toast>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Dynamic Alerts</h2>
        <Button onClick={addAlert}>Add Toast</Button>
        <Toast>
          {alerts().map((alert, index) => (
            <div
              class={`alert alert-${alert.status} flex justify-between gap-4`}
              style="min-width: 16rem;"
            >
              <span>{alert.text}</span>
              <button
                class="btn btn-sm btn-ghost"
                onClick={() => removeAlert(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </Toast>
      </section>
    </div>
  );
};

export default ToastShowcase;
