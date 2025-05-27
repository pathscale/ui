import type { Component } from "solid-js";
import { Avatar } from "../../";
import Mask from "../mask/Mask";    

const AvatarShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default Avatar</h2>
        <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Custom Size</h2>
        <div class="flex items-center gap-4">
          <Avatar shape="circle" size={30} src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Sizes</h2>
        <div class="flex items-center gap-4">
          <Avatar size="lg" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar size="md" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar size={4 * 20} src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar size={4 * 16} src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar size="sm" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar size="xs" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Rounded vs Squared</h2>
        <div class="flex items-center gap-4">
          <Avatar innerClass="rounded-xl" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar shape="circle" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Mask Variants</h2>
        <div class="flex items-center gap-4">
          <Avatar innerClass={Mask.className({ variant: "squircle" })} src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar innerClass={Mask.className({ variant: "hexagon" })} src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar innerClass={Mask.className({ variant: "triangle" })} src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Group Avatars</h2>
        <Avatar.Group>
          <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </Avatar.Group>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Group with Counter</h2>
        <Avatar.Group>
          <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <Avatar letters="+99" />
        </Avatar.Group>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Group Spacing</h2>
        <div class="flex flex-col items-center gap-y-4">
          <Avatar.Group class="space-x-4">
            <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            <Avatar letters="+99" />
          </Avatar.Group>
          <Avatar.Group class="space-x-0">
            <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            <Avatar letters="+99" />
          </Avatar.Group>
          <Avatar.Group class="-space-x-4">
            <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            <Avatar letters="+99" />
          </Avatar.Group>
          <Avatar.Group class="-space-x-8">
            <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            <Avatar letters="+99" />
          </Avatar.Group>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Ring & Border</h2>
        <Avatar border borderColor="primary" shape="circle" />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Presence Indicator</h2>
        <div class="flex items-center gap-4">
          <Avatar online shape="circle" />
          <Avatar offline shape="circle" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Placeholder Letters</h2>
        <div class="flex items-center gap-4">
          <Avatar letters="K" size="lg" shape="circle" />
          <Avatar letters="JO" size="md" shape="circle" online />
          <Avatar letters="MX" size="sm" shape="circle" />
          <Avatar letters="AA" size="xs" shape="circle" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Color & Border Combinations</h2>
        <div class="flex flex-wrap gap-4">
          {["neutral", "primary", "secondary", "accent", "info", "success", "warning", "error"].map((c: string) => (
            <Avatar key={c} border borderColor="primary" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          ))}
        </div>
        <div class="flex flex-wrap gap-4 mt-4">
          {["neutral", "primary", "secondary", "accent", "info", "success", "warning", "error"].map((c) => (
            <Avatar key={c} border borderColor="primary" color="secondary" letters="Y" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default AvatarShowcase;
