export function removeElement(el: HTMLElement) {
  if (typeof el.remove === "function") {
    el.remove();
  } else {
    el.parentNode?.removeChild(el);
  }
}
