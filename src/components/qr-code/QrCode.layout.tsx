import "./QrCode.css";
import type { JSX } from "@solidjs/web";
import { createMemo } from "solid-js";
import type { Layout } from "../../lib/layouts";
import type { QrErrorCorrectionLevel } from "../../lib/qr/qrMatrix";
import { qrMatrix } from "../../lib/qr/qrMatrix";
import type { UIBaseProps } from "../vocabulary";
import { componentRecipe } from "./QrCode.recipe";

export type QrCodeProps = Omit<
  JSX.SvgSVGAttributes<SVGSVGElement>,
  | "aria-label"
  | "aria-labelledby"
  | "children"
  | "height"
  | "role"
  | "title"
  | "viewBox"
  | "width"
> &
  UIBaseProps & {
    /** The text encoded into the QR matrix. */
    value: string;
    /** Accessible name for the QR image. */
    title: string;
    /** Reed-Solomon error correction level. Defaults to M. */
    level?: QrErrorCorrectionLevel;
    /** Rendered square size in CSS pixels or another CSS length. */
    size?: number | string;
  };

function matrixPath(matrix: boolean[][]): string {
  const path: string[] = [];

  for (let row = 0; row < matrix.length; row++) {
    let column = 0;
    while (column < matrix[row].length) {
      if (!matrix[row][column]) {
        column++;
        continue;
      }

      const start = column;
      while (column < matrix[row].length && matrix[row][column]) column++;
      const x = start + 4;
      const y = row + 4;
      path.push(`M${x} ${y}h${column - start}v1h-${column - start}z`);
    }
  }

  return path.join("");
}

const QrCodeLayout: Layout<typeof componentRecipe, QrCodeProps> = () => {
  const matrix = createMemo(() => qrMatrix(local.value, local.level ?? "M"));
  const path = createMemo(() => matrixPath(matrix()));
  const viewBox = () => {
    const size = matrix().length + 8;
    return `0 0 ${size} ${size}`;
  };

  return (
    <svg
      {...slot.root}
      width={local.size ?? 128}
      height={local.size ?? 128}
      viewBox={viewBox()}
      shape-rendering="crispEdges"
      role="img"
      aria-label={local.title}
      data-slot="qr-code"
      data-theme={local.dataTheme}
      style={local.style}
    >
      <title>{local.title}</title>
      <path
        {...slot.modules}
        d={path()}
        fill="currentColor"
        data-slot="qr-code-modules"
      />
    </svg>
  );
};

export default QrCodeLayout;
export { QrCodeLayout as QrCode };
