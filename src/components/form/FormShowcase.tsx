import { createSignal } from "solid-js";
import { z } from "zod";
import Form from "./Form";
import Input from "../input/Input";
import Flex from "../flex";
import Button from "../button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function FormShowcase() {
  const [formErrors, setFormErrors] = createSignal<Record<string, string>>({});

  const handleSubmit = (values: LoginForm) => {
    console.log("Form submitted with values:", values);
  };

  return (
    <div class="showcase-container">
      <Form.Validated
        schema={loginSchema}
        onSubmit={handleSubmit}
        onError={setFormErrors}
        class="w-full max-w-md mx-auto"
      >
        <Flex direction="col" gap="sm" class="mb-4">
          <Form.Label title="Email Address" />
          <Input
            name="email"
            type="email"
            placeholder="your@email.com"
            class={`input-bordered w-full ${
              formErrors().email ? "input-error" : ""
            }`}
          />
          {formErrors().email && (
            <div class="text-error text-sm">{formErrors().email}</div>
          )}
        </Flex>

        <Flex direction="col" gap="sm" class="mb-6">
          <Form.Label title="Password" />
          <Input
            name="password"
            type="password"
            placeholder="Your password"
            class={`input-bordered w-full ${
              formErrors().password ? "input-error" : ""
            }`}
          />
          {formErrors().password && (
            <div class="text-error text-sm">{formErrors().password}</div>
          )}
        </Flex>

        <Button variant="filled" color="primary" class="w-full" type="submit">
          Login
        </Button>
      </Form.Validated>
    </div>
  );
}
