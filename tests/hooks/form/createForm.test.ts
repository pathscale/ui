import { createRoot } from "solid-js";
import { describe, expect, it, mock } from "bun:test";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { createForm } from "../../../src/hooks/form/createForm";

type PasswordValues = {
  password: string;
};

const minPasswordSchema: StandardSchemaV1<PasswordValues> = {
  "~standard": {
    version: 1,
    vendor: "local-test",
    validate: (value) => {
      const formValue = value as PasswordValues;
      const password = typeof formValue.password === "string" ? formValue.password : "";

      if (password.length >= 4) {
        return { value: formValue };
      }

      return {
        issues: [
          {
            message: "Password must be at least 4 characters",
            path: ["password"],
          },
        ],
      };
    },
  },
};

const createPasswordForm = (onSubmit?: (value: PasswordValues) => void | Promise<void>) =>
  createRoot((dispose) => {
    const form = createForm<PasswordValues>({
      defaultValues: {
        password: "",
      },
      schema: minPasswordSchema,
      onSubmit,
    });

    return {
      form,
      dispose,
    };
  });

describe("createForm", () => {
  it("clears blur-origin errors after valid change", async () => {
    const { form, dispose } = createPasswordForm();
    const tsForm = form._tsForm;

    try {
      tsForm.setFieldValue("password", "abc");
      await tsForm.validateField("password", "blur");

      expect(tsForm.state.canSubmit).toBeFalse();
      expect(tsForm.getFieldMeta("password")?.errorMap?.onBlur).toBeDefined();

      tsForm.setFieldValue("password", "abcd");

      expect(tsForm.state.canSubmit).toBeTrue();
      expect(tsForm.getFieldMeta("password")?.errorMap?.onBlur).toBeUndefined();
    } finally {
      dispose();
    }
  });

  it("allows submit after correcting a blur-invalid value", async () => {
    const onSubmit = mock(async (_value: PasswordValues) => {});
    const { form, dispose } = createPasswordForm(onSubmit);
    const tsForm = form._tsForm;

    try {
      tsForm.setFieldValue("password", "abc");
      await tsForm.validateField("password", "blur");
      await tsForm.handleSubmit();

      expect(tsForm.state.canSubmit).toBeFalse();
      expect(onSubmit).toHaveBeenCalledTimes(0);

      tsForm.setFieldValue("password", "abcd");
      await tsForm.handleSubmit();

      expect(tsForm.state.canSubmit).toBeTrue();
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0]?.[0]).toEqual({ password: "abcd" });
    } finally {
      dispose();
    }
  });
});
