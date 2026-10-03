import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { qrMatrix } from "../../../src/lib/qr/qrMatrix";

const QR_CODE_LAYOUT = readFileSync(
  join(import.meta.dir, "../../../src/components/qr-code/QrCode.layout.tsx"),
  "utf8",
);

const FINDER_PATTERN = [
  "1111111",
  "1000001",
  "1011101",
  "1011101",
  "1011101",
  "1000001",
  "1111111",
];

function expectFinderPattern(
  matrix: boolean[][],
  top: number,
  left: number,
): void {
  for (let row = 0; row < FINDER_PATTERN.length; row++) {
    for (let column = 0; column < FINDER_PATTERN[row].length; column++) {
      expect(matrix[top + row][left + column]).toBe(
        FINDER_PATTERN[row][column] === "1",
      );
    }
  }
}

describe("qrMatrix", () => {
  it("encodes HELLO WORLD at level M as a version-one matrix", () => {
    const matrix = qrMatrix("HELLO WORLD", "M");

    expect(matrix).toHaveLength(21);
    expect(matrix.every((row) => row.length === 21)).toBe(true);
  });

  it("returns the same matrix for the same input", () => {
    expect(qrMatrix("HELLO WORLD", "M")).toEqual(qrMatrix("HELLO WORLD", "M"));
  });

  it("encodes an otpauth URI with a 32-character secret", () => {
    const secret = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const matrix = qrMatrix(
      `otpauth://totp/alice@example.com?secret=${secret}&issuer=Example`,
    );

    expect(matrix.length).toBeGreaterThan(21);
    expect(matrix.every((row) => row.length === matrix.length)).toBe(true);
  });

  it("places finder patterns at all three corners", () => {
    const matrix = qrMatrix("HELLO WORLD", "M");
    const last = matrix.length - 7;

    expectFinderPattern(matrix, 0, 0);
    expectFinderPattern(matrix, 0, last);
    expectFinderPattern(matrix, last, 0);
  });
});

describe("QrCode", () => {
  it("renders one named SVG with the title as its accessible name", () => {
    expect(QR_CODE_LAYOUT.match(/<svg\b/g)).toHaveLength(1);
    expect(QR_CODE_LAYOUT).toContain('role="img"');
    expect(QR_CODE_LAYOUT).toContain("aria-label={local.title}");
    expect(QR_CODE_LAYOUT).toContain("<title>{local.title}</title>");
    expect(QR_CODE_LAYOUT.match(/<path\b/g)).toHaveLength(1);
    expect(QR_CODE_LAYOUT).toContain("viewBox={viewBox()}");
  });
});
