import { type Component } from "solid-js";
import Swap from "./Swap";

const iconVolumeOn = (
  <svg
    class="fill-current"
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
  >
    <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
  </svg>
);

const iconVolumeOff = (
  <svg
    class="fill-current"
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
  >
    <path d="M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L18,10.59L20.59,8L22,9.41L19.41,12L22,14.59L20.59,16L18,13.41L15.41,16L14,14.59L16.59,12Z" />
  </svg>
);

const iconHamburger = (
  <svg
    class="fill-current"
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 512 512"
  >
    <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
  </svg>
);

const iconClose = (
  <svg
    class="fill-current"
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 512 512"
  >
    <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
  </svg>
);

const SwapShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Text</h2>
        <Swap onElement="ON" offElement="OFF" />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Volume</h2>
        <Swap onElement={iconVolumeOn} offElement={iconVolumeOff} />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Hamburger</h2>
        <Swap rotate onElement={iconClose} offElement={iconHamburger} />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Rotate Effect</h2>
        <Swap
          rotate
          onElement={<div class="text-4xl">🔁</div>}
          offElement={<div class="text-4xl">✅</div>}
        />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Flip Effect</h2>
        <Swap
          flip
          class="text-6xl"
          onElement={<span>😈</span>}
          offElement={<span>😇</span>}
        />
      </section>
    </div>
  );
};

export default SwapShowcase;
