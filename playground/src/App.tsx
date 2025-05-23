
import AvatarShowcase from "../../src/components/avatar/AvatarShowcase";

export default function App() {
  const [theme, setTheme] = createSignal<"light" | "dark">("light");

  onMount(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  });

  const toggleTheme = () => {
    const next = theme() === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <main class="min-h-screen">
      <AvatarShowcase/>
    </main>
  );
}
