import Background from "../../src/components/background";
import Button from "../../src/components/button";
import Flex from "../../src/components/flex/Flex";
import CopyButton from "../../src/components/copy-button/CopyButton";
import ToastStack from "../../src/components/toastcontainer/ToastStack";
import { toastStore } from "../../src/stores/toastStore";

export default function App() {
  return (
    <Background>
      <Flex
        direction="col"
        align="center"
        justify="center"
        gap="lg"
        class="min-h-screen text-center"
      >
        <h1 class="text-5xl font-bold text-primary">
          Welcome to Pathscale UI Playground
        </h1>
        <p class="text-base text-neutral-content max-w-md">
          You can start editing <code class="font-mono">App.tsx</code> to try
          out any component from <code>@pathscale/ui</code>.
        </p>
        <CopyButton
          text="Copy"
          copiedToken={"jiohiohiohjioj"}
        >
          hiohoho
        </CopyButton>
        <Flex gap="sm" wrap="wrap" justify="center">
          <Button onClick={() => toastStore.showSuccess("Saved changes.")}>
            Success Toast
          </Button>
          <Button
            color="warning"
            onClick={() => toastStore.showWarning("Check your input.")}
          >
            Warning Toast
          </Button>
          <Button
            color="error"
            onClick={() => toastStore.showError("Payment failed.")}
          >
            Error Toast
          </Button>
          <Button
            color="error"
            onClick={() =>
              toastStore.addToast("Transient error (4s).", "error", 4000)
            }
          >
            Error Toast (Timed)
          </Button>
          <Button onClick={() => toastStore.showInfo("New message received.")}>
            Info Toast
          </Button>
          <Button
            variant="outline"
            onClick={() => toastStore.clearAll()}
          >
            Clear All
          </Button>
        </Flex>
        <div class="max-w-xl text-sm text-neutral-content/80 leading-relaxed">
          <p>
            ToastStack test: errors are persistent by default and should stay
            until dismissed. Timed toasts should auto-dismiss. Click the latest
            toast to expand or collapse the stack.
          </p>
        </div>
      </Flex>
      <ToastStack max={4} />
    </Background>
  );
}
