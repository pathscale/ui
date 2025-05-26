import Navbar from "./Navbar";
import NavbarItem from "./NavbarItem";
import NavbarDropdown from "./NavbarDropdown";

const NavbarShowcase = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Basic Usage</h2>
        <Navbar>
          <div class="px-4">Basic Navbar</div>
        </Navbar>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Colors</h2>
        <div class="space-y-4">
          <Navbar color="info">
            <div class="px-4">Info Navbar</div>
          </Navbar>
          <Navbar color="primary">
            <div class="px-4">Primary Navbar</div>
          </Navbar>
          <Navbar color="success">
            <div class="px-4">Success Navbar</div>
          </Navbar>
          <Navbar color="light">
            <div class="px-4">Light Navbar</div>
          </Navbar>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">With Items</h2>
        <Navbar
          modelValue="Home"
          onChange={(val) => console.log("selected:", val)}
        >
          <NavbarItem label="Home">Home</NavbarItem>
          <NavbarItem label="Features">Features</NavbarItem>
          <NavbarItem label="Pricing">Pricing</NavbarItem>
          <NavbarItem label="About">About</NavbarItem>
          <NavbarItem label="Login">Login</NavbarItem>
          <NavbarItem label="Sign Up">Sign Up</NavbarItem>
        </Navbar>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">With Dropdown</h2>
        <Navbar
          modelValue="Home"
          onChange={(val) => console.log("selected:", val)}
        >
          <NavbarItem label="Home">Home</NavbarItem>
          <NavbarDropdown label="Products" hoverable>
            <div class="p-2 space-y-1">
              <NavbarItem label="Product A" color="light">
                Product A
              </NavbarItem>
              <NavbarItem label="Product B" color="light">
                Product B
              </NavbarItem>
            </div>
          </NavbarDropdown>
          <NavbarDropdown label="Resources" hoverable align="right">
            <div class="p-2 space-y-1">
              <NavbarItem label="Docs" color="light">
                Docs
              </NavbarItem>
              <NavbarItem label="API" color="light">
                API
              </NavbarItem>
            </div>
          </NavbarDropdown>
        </Navbar>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">With Brand</h2>
        <Navbar
          modelValue="Home"
          onChange={(val) => console.log("selected:", val)}
        >
          <NavbarItem label="Home">
            <span class="text-xl font-bold">Logo</span>
          </NavbarItem>
          <NavbarItem label="Features">Features</NavbarItem>
          <NavbarItem label="About">About</NavbarItem>
        </Navbar>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Visual Variants
        </h2>
        <div class="space-y-6">
          <Navbar color="primary" spaced shadow modelValue="Home">
            <NavbarItem label="Home">Home</NavbarItem>
            <NavbarItem label="About">About</NavbarItem>
            <NavbarItem label="Contact">Contact</NavbarItem>
          </Navbar>

          <Navbar color="light" transparent modelValue="Home">
            <NavbarItem label="Home">Home</NavbarItem>
            <NavbarItem label="Docs">Docs</NavbarItem>
            <NavbarItem label="API">API</NavbarItem>
          </Navbar>
        </div>
      </section>
    </div>
  );
};

export default NavbarShowcase;
