import { createSignal, onMount } from "solid-js";

import Background from "../../src/components/background";
import Flex from "../../src/components/flex/Flex";
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
        <aside class="w-48 border-r border-base-300 p-4 flex flex-col sticky top-0 h-screen bg-base-200">
          <button
            onClick={toggleTheme}
            class="mt-4 px-3 py-2 rounded bg-base-300 hover:bg-base-100 transition-colors"
          >
            {theme() === "light" ? "Dark" : "Light"}
          </button>
        </aside>

        <main class="flex-1 p-8 space-y-16 scroll-smooth">
          <FlexShowcase />
          <GridShowcase />
        </main>
      </Flex>
    </Background>
  );
}
