import { createSignal, onCleanup, onMount } from "solid-js";

export function useDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = createSignal(false);

  const checkIfDesktop = () => {
    const width = window.innerWidth;
    setIsDesktop(width >= breakpoint);
  };

  onMount(() => {
    checkIfDesktop();
    window.addEventListener("resize", checkIfDesktop);
  });

  onCleanup(() => {
    window.removeEventListener("resize", checkIfDesktop);
  });

  return isDesktop;
}
