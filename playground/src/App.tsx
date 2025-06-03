import Background from "../../src/components/background";
import Flex from "../../src/components/flex/Flex";
import SidenavDebugShowcase from "../../src/components/sidenav/SidenavDebugShowcase";

export default function App() {
  return (
    <Background>
      <SidenavDebugShowcase />
      <Flex class="min-h-screen">
        <main class="flex-1 p-8 space-y-16 scroll-smooth"></main>
      </Flex>
    </Background>
  );
}
