export type PasswordCustomRegexRule = {
  key: string;
  regex: RegExp;
  message: string;
};

export type PasswordRuleConfig = {
  minLength?: number;
  requireUpper?: boolean;
  requireLower?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
  customRegexRules?: PasswordCustomRegexRule[];
};

export type PasswordRuleResult = {
  key: string;
  message: string;
  passed: boolean;
};

export const evaluatePasswordRules = (
  password: string,
  config: PasswordRuleConfig,
): PasswordRuleResult[] => {
  const value = password ?? "";
  const results: PasswordRuleResult[] = [];

  if (typeof config.minLength === "number") {
    results.push({
      key: "minLength",
      message: `At least ${config.minLength} characters`,
      passed: value.length >= config.minLength,
    });
  }

  if (config.requireUpper) {
    results.push({
      key: "requireUpper",
      message: "At least one uppercase letter",
      passed: /[A-Z]/.test(value),
    });
  }

  if (config.requireLower) {
    results.push({
      key: "requireLower",
      message: "At least one lowercase letter",
      passed: /[a-z]/.test(value),
    });
  }

  if (config.requireNumber) {
    results.push({
      key: "requireNumber",
      message: "At least one number",
      passed: /[0-9]/.test(value),
    });
  }

  if (config.requireSpecial) {
    results.push({
      key: "requireSpecial",
      message: "At least one special character",
      passed: /[^A-Za-z0-9]/.test(value),
    });
  }

  for (const customRule of config.customRegexRules ?? []) {
    customRule.regex.lastIndex = 0;
    results.push({
      key: customRule.key,
      message: customRule.message,
      passed: customRule.regex.test(value),
    });
  }

  return results;
};

export const matchPasswordConfirmation = (password: string, confirm: string): boolean => {
  return password === confirm;
};
