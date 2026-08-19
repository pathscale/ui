import { describe, expect, it, mock } from "bun:test";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { createRoot } from "solid-js";
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
      const password =
        typeof formValue.password === "string" ? formValue.password : "";

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

const createPasswordForm = (
  onSubmit?: (value: PasswordValues) => void | Promise<void>,
) =>
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

    try {
      form.setFieldValue("password", "abc");
      await form.validateField("password", "blur");

      expect(form.isValid()).toBeFalse();
      expect(form.getFieldMeta("password").errors.length).toBeGreaterThan(0);
      expect(form.getFieldMeta("password").isTouched).toBeTrue();

      form.setFieldValue("password", "abcd");

      expect(form.isValid()).toBeTrue();
      expect(form.getFieldMeta("password").errors).toEqual([]);
    } finally {
      dispose();
    }
  });

  it("allows submit after correcting a blur-invalid value", async () => {
    const onSubmit = mock(async (_value: PasswordValues) => {});
    const { form, dispose } = createPasswordForm(onSubmit);

    try {
      form.setFieldValue("password", "abc");
      await form.validateField("password", "blur");
      await form.submit();

      expect(form.isValid()).toBeFalse();
      expect(onSubmit).toHaveBeenCalledTimes(0);

      form.setFieldValue("password", "abcd");
      await form.submit();

      expect(form.isValid()).toBeTrue();
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0]?.[0]).toEqual({ password: "abcd" });
    } finally {
      dispose();
    }
  });

  it("shows every error on a failed submit, not only the touched ones", async () => {
    const onSubmit = mock(async (_value: PasswordValues) => {});
    const { form, dispose } = createPasswordForm(onSubmit);

    try {
      // Nothing blurred, so nothing is touched and nothing displays yet.
      expect(form.getFieldMeta("password").isTouched).toBeFalse();

      form.setFieldValue("password", "abc");
      await form.submit();

      // A submit that refuses has to say why, so it touches everything.
      expect(form.getFieldMeta("password").isTouched).toBeTrue();
      expect(onSubmit).toHaveBeenCalledTimes(0);
    } finally {
      dispose();
    }
  });
});
