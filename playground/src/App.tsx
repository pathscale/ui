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
          <Button onClick={() => toastStore.showInfo("New message received.")}>
            Info Toast
          </Button>
        </Flex>
      </Flex>
      <ToastStack max={4} />
    </Background>
  );
}
