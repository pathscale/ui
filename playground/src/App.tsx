import ImmersiveLanding from "../../src/components/immersive-landing";

const pages = ["intro", "features", "cta"] as const;

export default function App() {
  return (
    <ImmersiveLanding
      pages={pages}
      appVersion="1.4.3"
      showArrows
      showNavigation
    >
      <ImmersiveLanding.Page id="intro">
        <section class="h-full w-full bg-base-100 text-base-content">
          <div class="mx-auto flex h-full w-full max-w-5xl items-center justify-center px-6">
            <div class="space-y-4 text-center">
              <p class="text-xs uppercase tracking-[0.4em] text-base-content/60">
                Immersive Landing
              </p>
              <h1 class="text-5xl font-semibold">
                Version watermark check
              </h1>
              <p class="text-base text-base-content/70">
                Scroll, swipe, or use arrows to move between pages.
              </p>
            </div>
          </div>
        </section>
      </ImmersiveLanding.Page>

      <ImmersiveLanding.Page id="features">
        <section class="h-full w-full bg-gradient-to-br from-base-100 via-base-200 to-base-300 text-base-content">
          <div class="mx-auto flex h-full w-full max-w-5xl items-center justify-center px-6">
            <div class="space-y-4 text-center">
              <p class="text-xs uppercase tracking-[0.4em] text-base-content/60">
                Page Two
              </p>
              <h2 class="text-4xl font-semibold">Minimal layout</h2>
              <p class="text-base text-base-content/70">
                No overlays or app chrome. Just the component and the
                watermark.
              </p>
            </div>
          </div>
        </section>
      </ImmersiveLanding.Page>

      <ImmersiveLanding.Page id="cta">
        <section class="h-full w-full bg-base-200 text-base-content">
          <div class="mx-auto flex h-full w-full max-w-5xl items-center justify-center px-6">
            <div class="space-y-4 text-center">
              <p class="text-xs uppercase tracking-[0.4em] text-base-content/60">
                Final Page
              </p>
              <h2 class="text-4xl font-semibold">Watermark visibility</h2>
              <p class="text-base text-base-content/70">
                The version should read as a subtle background element.
              </p>
            </div>
          </div>
        </section>
      </ImmersiveLanding.Page>
    </ImmersiveLanding>
  );
}
