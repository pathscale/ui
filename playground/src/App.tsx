import Background from "../../src/components/background";
import Flex from "../../src/components/flex/Flex";
import CopyButton from "../../src/components/copy-button/CopyButton";

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
      </Flex>
    </Background>
  );
}
