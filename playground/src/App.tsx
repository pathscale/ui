import Background from "../../src/components/background";
import Flex from "../../src/components/flex/Flex";

export default function App() {
  return (
    <Background>
      <Flex class="min-h-screen">
        <main class="flex-1 p-8 space-y-16 scroll-smooth"></main>
      </Flex>
    </Background>
  );
}
