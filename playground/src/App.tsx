import Background from "../../src/components/background";
import Button from "../../src/components/button";
import Flex from "../../src/components/flex/Flex";
import CopyButton from "../../src/components/copy-button/CopyButton";
import ToastStack from "../../src/components/toastcontainer/ToastStack";
import { toastStore } from "../../src/stores/toastStore";
import { createSignal } from "solid-js";
import ColorPicker from "@src/components/colorpicker";

export default function App() {
  const [color1, setColor1] = createSignal("#4ECDC4");
  const [color2, setColor2] = createSignal("rgb(255, 107, 107)");
  const [color3, setColor3] = createSignal("rgba(69, 183, 209, 0.7)");
  const [color4, setColor4] = createSignal("hsl(45, 100%, 60%)");
  const [color5, setColor5] = createSignal("#98D8C8");

  return (
    <Background>
      <Flex
        direction="col"
        align="center"
        justify="center"
        gap="lg"
        class="min-h-screen text-center"
      >
        <h1 class="text-5xl font-bold text-primary">
          Welcome to Pathscale UI Playground
        </h1>
        <p class="text-base text-neutral-content max-w-md">
          You can start editing <code class="font-mono">App.tsx</code> to try
          out any component from <code>@pathscale/ui</code>.
        </p>
        <CopyButton text="Copy" copiedToken={"jiohiohiohjioj"}>
          hiohoho
        </CopyButton>
        <Flex gap="sm" wrap="wrap" justify="center">
          <Button onClick={() => toastStore.showSuccess("Saved changes.")}>
            Success Toast
          </Button>
          <Button
            color="warning"
            onClick={() => toastStore.showWarning("Check your input.")}
          >
            Warning Toast
          </Button>
          <Button
            color="error"
            onClick={() => toastStore.showError("Payment failed.")}
          >
            Error Toast
          </Button>
          <Button
            color="error"
            onClick={() =>
              toastStore.addToast("Transient error (4s).", "error", 4000)
            }
          >
            Error Toast (Timed)
          </Button>
          <Button onClick={() => toastStore.showInfo("New message received.")}>
            Info Toast
          </Button>
          <Button variant="outline" onClick={() => toastStore.clearAll()}>
            Clear All
          </Button>
        </Flex>
        <div class="max-w-xl text-sm text-neutral-content/80 leading-relaxed">
          <p>
            ToastStack test: errors are persistent by default and should stay
            until dismissed. Timed toasts should auto-dismiss. Click the latest
            toast to expand or collapse the stack.
          </p>
        </div>
      </Flex>
      <ToastStack max={4} />
      <div class="mx-auto max-w-5xl w-full space-y-8">
        <div>
          <h1 class="text-5xl font-bold text-primary mb-4">
            ColorPicker Component
          </h1>
          <p class="text-base text-neutral-content">
            A comprehensive color picker with support for multiple formats,
            alpha channel, swatches, and full keyboard navigation.
          </p>
        </div>

        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-left">Basic Usage</h2>
          <div class="flex items-center gap-4">
            <ColorPicker
              value={color1()}
              onChange={(c) => setColor1(c)}
              format="hex"
            />
            <div class="text-left">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Selected Color (HEX):
              </p>
              <p class="font-mono text-lg font-bold">{color1()}</p>
            </div>
          </div>
        </section>

        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-left">
            Multiple Color Formats
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="flex flex-col items-center gap-2">
              <ColorPicker value={color1()} onChange={setColor1} format="hex" />
              <div class="text-center">
                <p class="text-xs text-gray-500">HEX</p>
                <p class="font-mono text-sm">{color1()}</p>
              </div>
            </div>
            <div class="flex flex-col items-center gap-2">
              <ColorPicker value={color2()} onChange={setColor2} format="rgb" />
              <div class="text-center">
                <p class="text-xs text-gray-500">RGB</p>
                <p class="font-mono text-sm">{color2()}</p>
              </div>
            </div>
            <div class="flex flex-col items-center gap-2">
              <ColorPicker
                value={color3()}
                onChange={setColor3}
                format="rgba"
                showAlpha
              />
              <div class="text-center">
                <p class="text-xs text-gray-500">RGBA</p>
                <p class="font-mono text-sm">{color3()}</p>
              </div>
            </div>
            <div class="flex flex-col items-center gap-2">
              <ColorPicker value={color4()} onChange={setColor4} format="hsl" />
              <div class="text-center">
                <p class="text-xs text-gray-500">HSL</p>
                <p class="font-mono text-sm">{color4()}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-left">
            With Alpha/Opacity Control
          </h2>
          <div class="flex items-center gap-4">
            <ColorPicker
              value={color3()}
              onChange={setColor3}
              format="rgba"
              showAlpha
            />
            <div class="text-left">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Selected Color (RGBA):
              </p>
              <p class="font-mono text-lg font-bold">{color3()}</p>
              <div
                class="mt-2 w-full h-12 rounded border-2 border-gray-300"
                style={{
                  "background-image":
                    "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                  "background-size": "20px 20px",
                  "background-position": "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
              >
                <div
                  class="w-full h-full rounded"
                  style={{ "background-color": color3() }}
                />
              </div>
            </div>
          </div>
        </section>

        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-left">Custom Swatches</h2>
          <div class="flex items-center gap-4">
            <ColorPicker
              value={color5()}
              onChange={setColor5}
              format="hex"
              swatches={[
                "#FF6B6B",
                "#4ECDC4",
                "#45B7D1",
                "#FFA07A",
                "#98D8C8",
                "#F7DC6F",
                "#BB8FCE",
                "#85929E",
              ]}
            />
            <div class="text-left">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Custom Color Palette:
              </p>
              <p class="font-mono text-lg font-bold">{color5()}</p>
            </div>
          </div>
        </section>

        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-left">Flower Color Wheel Mode</h2>
          <div class="flex items-center gap-4">
            <ColorPicker
              value={color4()}
              onChange={setColor4}
              format="hsl"
              initialMode="flower"
            />
            <div class="text-left">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Color Picker:
              </p>
              <p class="font-mono text-lg font-bold">{color4()}</p>
            </div>
          </div>
        </section>

        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-left">
            Popover Placement Options
          </h2>
          <div class="flex items-center justify-around gap-4 flex-wrap">
            <div class="flex flex-col items-center gap-2">
              <ColorPicker
                value={color1()}
                onChange={setColor1}
                placement="bottom"
              />
              <p class="text-xs text-gray-500">Bottom (default)</p>
            </div>
            <div class="flex flex-col items-center gap-2">
              <ColorPicker
                value={color2()}
                onChange={setColor2}
                placement="top"
              />
              <p class="text-xs text-gray-500">Top</p>
            </div>
            <div class="flex flex-col items-center gap-2">
              <ColorPicker
                value={color3()}
                onChange={setColor3}
                placement="left"
              />
              <p class="text-xs text-gray-500">Left</p>
            </div>
            <div class="flex flex-col items-center gap-2">
              <ColorPicker
                value={color4()}
                onChange={setColor4}
                placement="right"
              />
              <p class="text-xs text-gray-500">Right</p>
            </div>
          </div>
        </section>

        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-left">Disabled State</h2>
          <div class="flex items-center gap-4">
            <ColorPicker value="#98D8C8" disabled />
            <p class="text-sm text-gray-600 dark:text-gray-400">
              This picker is disabled and cannot be opened.
            </p>
          </div>
        </section>

        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-left">Keyboard Navigation</h2>
          <div class="text-left space-y-2 text-sm">
            <p class="font-semibold">Try these keyboard shortcuts:</p>
            <ul class="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  Tab
                </kbd>{" "}
                - Navigate between elements
              </li>
              <li>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  Arrow Keys
                </kbd>{" "}
                - Adjust sliders and saturation/brightness
              </li>
              <li>
                <kbd class="px-1 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  Enter
                </kbd>{" "}
                - Select swatches
              </li>
              <li>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  Escape
                </kbd>{" "}
                - Close popover
              </li>
            </ul>
            <div class="mt-4">
              <ColorPicker value={color1()} onChange={setColor1} />
            </div>
          </div>
        </section>

        <section class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold mb-4 text-left">API Reference</h2>
          <div class="text-left">
            <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-xs overflow-x-auto">
              {`<ColorPicker
  value?: string
  onChange?: (color: string) => void
  format?: ColorFormat            // 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla'
  disabled?: boolean
  swatches?: string[]
  showAlpha?: boolean
  placement?: 'top' | 'bottom' | 'left' | 'right'
/>`}
            </pre>
          </div>
        </section>
      </div>
    </Background>
  );
}
