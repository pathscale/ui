import Background from "../../src/components/background";
import Flex from "../../src/components/flex/Flex";
import SidenavShowcase from "../../src/components/sidenav/SidenavShowcase";

export default function App() {
  return (
    <Background>
      <Flex class="min-h-screen">
        <main class="flex-1 p-8 space-y-16 scroll-smooth">
          <SidenavShowcase />
        </main>
      </Flex>
    </Background>
  );
}
