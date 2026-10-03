import { expect, test } from "bun:test";
import { isPrintableAsciiPassword } from "../../src/passwordRules";

test("accepts every printable ASCII character without normalizing whitespace", () => {
  const printable = Array.from({ length: 95 }, (_, i) =>
    String.fromCharCode(i + 0x20),
  ).join("");
  expect(isPrintableAsciiPassword(printable)).toBe(true);
  expect(isPrintableAsciiPassword('  Password1!,"  ')).toBe(true);
  expect(isPrintableAsciiPassword("")).toBe(true);
});

test("rejects controls, DEL, Unicode, and lone surrogates", () => {
  for (let code = 0; code < 0x20; code++) {
    expect(
      isPrintableAsciiPassword(`Password1${String.fromCharCode(code)}`),
    ).toBe(false);
  }
  for (const value of ["\x7f", "é", "漢", "😀", "\uD800", "\u00A0"]) {
    expect(isPrintableAsciiPassword(`Password1${value}`)).toBe(false);
  }
});
