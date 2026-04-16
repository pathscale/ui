/**
 * FormExample.tsx — playground demonstration of the new TanStack Form API
 *
 * Shows two usage patterns side by side:
 *   1. Standard: createForm + <Form> + <FormField> + <FormSubmitButton>
 *   2. Custom field: createForm + useField() for bespoke rendering
 */
import { createSignal, Show } from "solid-js";
import { z } from "zod";
import {
  createForm,
  Form,
  FormField,
  FormSubmitButton,
  useFormContext,
  getFirstFieldError,
  Input,
  Label,
} from "@pathscale/ui";

// ---------------------------------------------------------------------------
// Schemas — defined once at module level, never re-created on render
// ---------------------------------------------------------------------------

const signupSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "At least 3 characters")
    .max(32, "At most 32 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscores"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "At least 8 characters"),
});

type SignupValues = z.infer<typeof signupSchema>;

// ---------------------------------------------------------------------------
// Custom field — calls useField() inside a <Form> tree
// ---------------------------------------------------------------------------

const PasswordStrengthField = () => {
  const form = useFormContext();
  const tsForm = form._tsForm;

  return (
    <tsForm.Field
      name="password"
      children={(field: any) => {
        const password = () => String(field().state.value ?? "");
        const strength = () => {
          const p = password();
          if (p.length === 0) return 0;
          if (p.length < 6) return 1;
          if (p.length < 10 || !/[A-Z]/.test(p)) return 2;
          return 3;
        };
        const strengthLabel = () => ["", "Weak", "Fair", "Strong"][strength()];
        const strengthColors = ["", "bg-error", "bg-warning", "bg-success"];

        const error = () =>
          field().state.meta.isTouched
            ? getFirstFieldError((field().state.meta.errors ?? []) as unknown[])
            : undefined;

        return (
          <div class="flex flex-col gap-1">
            <Label for="password">Password</Label>
            <Input.Field
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={password()}
              onInput={(e: any) => field().handleChange(e.currentTarget.value)}
              onBlur={() => field().handleBlur()}
              isInvalid={Boolean(error())}
            />
            {/* Strength meter */}
            <Show when={password().length > 0}>
              <div class="flex items-center gap-2">
                <div class="flex flex-1 gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      class={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        strength() >= level
                          ? strengthColors[strength()]
                          : "bg-base-300"
                      }`}
                    />
                  ))}
                </div>
                <span class="text-xs opacity-70">{strengthLabel()}</span>
              </div>
            </Show>
            <Show when={error()}>
              <p class="text-xs text-error" role="alert">
                {error()}
              </p>
            </Show>
          </div>
        );
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Main example component
// ---------------------------------------------------------------------------

export const FormExample = () => {
  const [submitResult, setSubmitResult] = createSignal<SignupValues | null>(
    null,
  );
  const [apiError, setApiError] = createSignal<string | null>(null);

  const form = createForm<SignupValues>({
    defaultValues: { username: "", email: "", password: "" },
    schema: signupSchema,
    onSubmit: async (values) => {
      setApiError(null);
      // Simulate an async call with a possible server-side error
      await new Promise((r) => setTimeout(r, 800));
      if (values.username === "admin") {
        setApiError("Username 'admin' is reserved. Choose another.");
        return;
      }
      setSubmitResult(values);
    },
  });

  return (
    <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
      <div>
        <h2 class="text-sm font-semibold">New Form API (TanStack Form)</h2>
        <p class="text-xs opacity-70">
          createForm + {"<Form>"} + {"<FormField>"} + {"<FormSubmitButton>"}. Zero
          WeakMap, zero directive, Standard Schema validation (Zod).
        </p>
      </div>

      <div class="grid gap-6 sm:grid-cols-2">
        {/* ---------------------------------------------------------------- */}
        {/* Left: the form                                                   */}
        {/* ---------------------------------------------------------------- */}
        <div>
          <Form form={form} class="space-y-4">
            {/* Standard <FormField> usage */}
            <FormField
              name="username"
              label="Username"
              inputProps={{ placeholder: "e.g. john_doe", autocomplete: "username" }}
            />
            <FormField
              name="email"
              label="Email address"
              inputProps={{ type: "email", placeholder: "you@example.com", autocomplete: "email" }}
            />

            {/* Custom field using useFormContext() + form._tsForm.Field */}
            <PasswordStrengthField />

            <Show when={apiError()}>
              <p class="rounded border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                {apiError()}
              </p>
            </Show>

            <FormSubmitButton class="w-full">Create account</FormSubmitButton>
          </Form>

          <Show when={submitResult()}>
            {(result) => (
              <div class="mt-4 rounded border border-success/30 bg-success/10 px-3 py-2 text-xs">
                <p class="font-semibold text-success">✓ Submitted successfully</p>
                <pre class="mt-1 opacity-70">{JSON.stringify(result(), null, 2)}</pre>
              </div>
            )}
          </Show>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Right: API description                                           */}
        {/* ---------------------------------------------------------------- */}
        <div class="space-y-3 text-xs opacity-80">
          <div>
            <p class="mb-1 font-semibold">createForm()</p>
            <p>
              Wraps TanStack Form. Pass any Standard Schema (Zod, Valibot, …).
              Validates on blur <em>and</em> submit automatically.
            </p>
          </div>
          <div>
            <p class="mb-1 font-semibold">{"<Form form={form}>"}</p>
            <p>
              Context provider + native form. No <code>use:form</code> directive.
              Fields inside find the form automatically.
            </p>
          </div>
          <div>
            <p class="mb-1 font-semibold">{"<FormField name=\"...\">"}</p>
            <p>
              Label + Input + error message in one. Reads form from context.
              Pass <code>inputProps</code> for type, placeholder, etc.
            </p>
          </div>
          <div>
            <p class="mb-1 font-semibold">{"<FormSubmitButton>"}</p>
            <p>
              Auto-disables when form is invalid,
              shows pending state during submit. No manual wiring.
            </p>
          </div>
          <div>
            <p class="mb-1 font-semibold">Custom fields via useFormContext()</p>
            <p>
              Access <code>form._tsForm</code> for full TanStack Form API.
              The Password field above adds a strength meter this way.
            </p>
          </div>
          <div>
            <p class="mb-1 font-semibold">Try: username = "admin"</p>
            <p>
              Server error is a plain <code>createSignal</code> alongside form
              state — correct separation of concerns.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
