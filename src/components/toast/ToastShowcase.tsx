import { type Component, createSignal } from "solid-js";
import Button from "../button/Button";
import Toast from "./Toast";

const ToastShowcase: Component = () => {
  const [alerts, setAlerts] = createSignal([
    { text: "This is a custom alert!", status: "info" },
  ]);

  const [limitedAlerts, setLimitedAlerts] = createSignal([
    { text: "Limited toast example", status: "info" },
  ]);

  const [alertCounter, setAlertCounter] = createSignal(1);
  const [limitedAlertCounter, setLimitedAlertCounter] = createSignal(1);

  const statuses = ["info", "success", "warning", "error"] as const;

  const addAlert = () => {
    const currentCounter = alertCounter();
    setAlertCounter(currentCounter + 1);

    setAlerts((prev) => [
      ...prev,
      {
        text: `Message #${currentCounter + 1}`,
        status: statuses[Math.floor(Math.random() * statuses.length)]!,
      },
    ]);
  };

  const addLimitedAlert = () => {
    const currentCounter = limitedAlertCounter();
    setLimitedAlertCounter(currentCounter + 1);

    setLimitedAlerts((prev) => {
      const maxInMemory = 3;
      const newAlert = {
        text: `Limited message #${currentCounter + 1}`,
        status: statuses[Math.floor(Math.random() * statuses.length)]!,
      };

      const newAlerts = [...prev, newAlert];

      if (newAlerts.length > maxInMemory) {
        return newAlerts.slice(-maxInMemory);
      }

      return newAlerts;
    });
  };

  const removeAlert = (index: number) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  const removeLimitedAlert = (index: number) => {
    setLimitedAlerts((prev) => prev.filter((_, i) => i !== index));
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
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Dynamic Alerts
        </h2>
        <div class="flex gap-2 mb-4">
          <Button onClick={addAlert}>Add Toast</Button>
        </div>
        <Toast max={0}>
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

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Limited Dynamic Alerts, Max 3
        </h2>
        <div class="flex gap-2 mb-4">
          <Button onClick={addLimitedAlert}>Add Toast</Button>
        </div>
        <Toast max={3}>
          {limitedAlerts().map((alert, index) => (
            <div
              class={`alert alert-${alert.status} flex justify-between gap-4`}
              style="min-width: 16rem;"
            >
              <span>{alert.text}</span>
              <button
                class="btn btn-sm btn-ghost"
                onClick={() => removeLimitedAlert(index)}
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
