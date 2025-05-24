import { type Component } from "solid-js";
import { Avatar } from "../../";

const AvatarShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default Avatar</h2>
        <Avatar src="https://i.pravatar.cc/300" alt="Jane Doe" />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Sizes</h2>
        <div class="flex items-center gap-4">
          <Avatar src="https://i.pravatar.cc/300" alt="Sm" size="sm" />
          <Avatar src="https://i.pravatar.cc/300" alt="Md" size="md" />
          <Avatar src="https://i.pravatar.cc/300" alt="Lg" size="lg" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Shapes</h2>
        <div class="flex items-center gap-4">
          <Avatar src="https://i.pravatar.cc/300" alt="Circle" shape="circle" />
          <Avatar src="https://i.pravatar.cc/300" alt="Rounded" shape="rounded" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Variants</h2>
        <div class="flex items-center gap-4">
          <Avatar src="https://i.pravatar.cc/300" alt="Filled" variant="filled" />
          <Avatar src="https://i.pravatar.cc/300" alt="Outlined" variant="outlined" />
          <Avatar src="https://i.pravatar.cc/300" alt="Ghost" variant="ghost" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Shape + Variant</h2>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <Avatar src="https://i.pravatar.cc/300" alt="Circle Filled" shape="circle" variant="filled" />
            <Avatar src="https://i.pravatar.cc/300" alt="Circle Outlined" shape="circle" variant="outlined" />
            <Avatar src="https://i.pravatar.cc/300" alt="Circle Ghost" shape="circle" variant="ghost" />
          </div>
          <div class="flex items-center gap-4">
            <Avatar src="https://i.pravatar.cc/300" alt="Rounded Filled" shape="rounded" variant="filled" />
            <Avatar src="https://i.pravatar.cc/300" alt="Rounded Outlined" shape="rounded" variant="outlined" />
            <Avatar src="https://i.pravatar.cc/300" alt="Rounded Ghost" shape="rounded" variant="ghost" />
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Fallback Text</h2>
        <div class="flex items-center gap-4">
          <Avatar alt="Alice Johnson" size="md" />
          <Avatar alt="John" size="md" />
          <Avatar size="md" />
        </div>
      </section>
    </div>
  );
};

export default AvatarShowcase;
