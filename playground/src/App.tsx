import { createSignal, onMount } from "solid-js";

import Background from "../../src/components/background";
import Flex from "../../src/components/flex/Flex";
import { Sidebar, SidebarItem } from "../../src/components/sidebar";
import FlexShowcase from "../../src/components/flex/FlexShowcase";
import GridShowcase from "../../src/components/grid/GridShowcase";

export default function App() {
  const [theme, setTheme] = createSignal<"light" | "dark">("light");

  onMount(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  });

  const toggleTheme = () => {
    const next = theme() === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <Background>
      <Flex class="min-h-screen">
        <Sidebar class="sticky top-0 h-screen w-52 p-4 border-r border-base-300 bg-base-200">
          <SidebarItem>
            <button
              onClick={toggleTheme}
              class="w-full text-left px-2 py-1 rounded hover:bg-base-100 transition-colors"
            >
              {theme() === "light" ? "Dark" : "Light"}
            </button>
          </SidebarItem>
        </Sidebar>

        <main class="flex-1 p-8 space-y-16 scroll-smooth">
          <FlexShowcase />
          <GridShowcase />
        </main>
      </Flex>
    </Background>
  );
}
