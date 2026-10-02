/*
 * QR Code encoder based on QRCode for JavaScript by davidshimjs and
 * Kazuhiko Arase.
 *
 * Copyright (c) 2009 Kazuhiko Arase
 * Copyright (c) davidshimjs
 *
 * Licensed under the MIT License.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

export type QrErrorCorrectionLevel = "L" | "M" | "Q" | "H";

const BYTE_MODE = 1 << 2;
const ERROR_CORRECTION_FORMAT_BITS: Record<QrErrorCorrectionLevel, number> = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
};
const ERROR_CORRECTION_TABLE_INDEX: Record<QrErrorCorrectionLevel, number> = {
  L: 0,
  M: 1,
  Q: 2,
  H: 3,
};

class QR8bitByte {
  readonly mode = BYTE_MODE;

  readonly data: number[];

  constructor(value: string) {
    this.data = Array.from(new TextEncoder().encode(value));

    // The source encoder prefixes UTF-8 data with a BOM so scanners can
    // identify its byte encoding. Keep that behavior for non-ASCII strings.
    if (this.data.length !== value.length) {
      this.data.unshift(0xef, 0xbb, 0xbf);
    }
  }

  getLength(): number {
    return this.data.length;
  }

  write(buffer: QRBitBuffer): void {
    for (const byte of this.data) buffer.put(byte, 8);
  }
}

class QRBitBuffer {
  readonly buffer: number[] = [];

  length = 0;

  getLengthInBits(): number {
    return this.length;
  }

  put(value: number, length: number): void {
    for (let index = 0; index < length; index++) {
      this.putBit(((value >>> (length - index - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean): void {
    const byteIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= byteIndex) this.buffer.push(0);
    if (bit) this.buffer[byteIndex] |= 0x80 >>> (this.length % 8);
    this.length++;
  }
}

const EXP_TABLE = new Array<number>(256);
const LOG_TABLE = new Array<number>(256);

for (let index = 0; index < 8; index++) EXP_TABLE[index] = 1 << index;
for (let index = 8; index < 256; index++) {
  EXP_TABLE[index] =
    EXP_TABLE[index - 4] ^
    EXP_TABLE[index - 5] ^
    EXP_TABLE[index - 6] ^
    EXP_TABLE[index - 8];
}
for (let index = 0; index < 255; index++) {
  LOG_TABLE[EXP_TABLE[index]] = index;
}

const QRMath = {
  glog(value: number): number {
    if (value < 1) throw new Error(`glog(${value})`);
    return LOG_TABLE[value];
  },

  gexp(value: number): number {
    let exponent = value;
    while (exponent < 0) exponent += 255;
    while (exponent >= 256) exponent -= 255;
    return EXP_TABLE[exponent];
  },
};

class QRPolynomial {
  readonly num: number[];

  constructor(values: number[], shift: number) {
    let offset = 0;
    while (offset < values.length && values[offset] === 0) offset++;
    this.num = [...values.slice(offset), ...new Array<number>(shift).fill(0)];
  }

  get(index: number): number {
    return this.num[index];
  }

  getLength(): number {
    return this.num.length;
  }

  multiply(other: QRPolynomial): QRPolynomial {
    const values = new Array<number>(
      this.getLength() + other.getLength() - 1,
    ).fill(0);
    for (let left = 0; left < this.getLength(); left++) {
      for (let right = 0; right < other.getLength(); right++) {
        values[left + right] ^= QRMath.gexp(
          QRMath.glog(this.get(left)) + QRMath.glog(other.get(right)),
        );
      }
    }
    return new QRPolynomial(values, 0);
  }

  mod(other: QRPolynomial): QRPolynomial {
    if (this.getLength() < other.getLength()) return this;

    const ratio = QRMath.glog(this.get(0)) - QRMath.glog(other.get(0));
    const values = this.num.slice();
    for (let index = 0; index < other.getLength(); index++) {
      values[index] ^= QRMath.gexp(QRMath.glog(other.get(index)) + ratio);
    }
    return new QRPolynomial(values, 0).mod(other);
  }
}

class QRRSBlock {
  constructor(
    readonly totalCount: number,
    readonly dataCount: number,
  ) {}

  static readonly RS_BLOCK_TABLE: readonly (readonly number[])[] = [
    [1, 26, 19],
    [1, 26, 16],
    [1, 26, 13],
    [1, 26, 9],
    [1, 44, 34],
    [1, 44, 28],
    [1, 44, 22],
    [1, 44, 16],
    [1, 70, 55],
    [1, 70, 44],
    [2, 35, 17],
    [2, 35, 13],
    [1, 100, 80],
    [2, 50, 32],
    [2, 50, 24],
    [4, 25, 9],
    [1, 134, 108],
    [2, 67, 43],
    [2, 33, 15, 2, 34, 16],
    [2, 33, 11, 2, 34, 12],
    [2, 86, 68],
    [4, 43, 27],
    [4, 43, 19],
    [4, 43, 15],
    [2, 98, 78],
    [4, 49, 31],
    [2, 32, 14, 4, 33, 15],
    [4, 39, 13, 1, 40, 14],
    [2, 121, 97],
    [2, 60, 38, 2, 61, 39],
    [4, 40, 18, 2, 41, 19],
    [4, 40, 14, 2, 41, 15],
    [2, 146, 116],
    [3, 58, 36, 2, 59, 37],
    [4, 36, 16, 4, 37, 17],
    [4, 36, 12, 4, 37, 13],
    [2, 86, 68, 2, 87, 69],
    [4, 69, 43, 1, 70, 44],
    [6, 43, 19, 2, 44, 20],
    [6, 43, 15, 2, 44, 16],
    [4, 101, 81],
    [1, 80, 50, 4, 81, 51],
    [4, 50, 22, 4, 51, 23],
    [3, 36, 12, 8, 37, 13],
    [2, 116, 92, 2, 117, 93],
    [6, 58, 36, 2, 59, 37],
    [4, 46, 20, 6, 47, 21],
    [7, 42, 14, 4, 43, 15],
    [4, 133, 107],
    [8, 59, 37, 1, 60, 38],
    [8, 44, 20, 4, 45, 21],
    [12, 33, 11, 4, 34, 12],
    [3, 145, 115, 1, 146, 116],
    [4, 64, 40, 5, 65, 41],
    [11, 36, 16, 5, 37, 17],
    [11, 36, 12, 5, 37, 13],
    [5, 109, 87, 1, 110, 88],
    [5, 65, 41, 5, 66, 42],
    [5, 54, 24, 7, 55, 25],
    [11, 36, 12],
    [5, 122, 98, 1, 123, 99],
    [7, 73, 45, 3, 74, 46],
    [15, 43, 19, 2, 44, 20],
    [3, 45, 15, 13, 46, 16],
    [1, 135, 107, 5, 136, 108],
    [10, 74, 46, 1, 75, 47],
    [1, 50, 22, 15, 51, 23],
    [2, 42, 14, 17, 43, 15],
    [5, 150, 120, 1, 151, 121],
    [9, 69, 43, 4, 70, 44],
    [17, 50, 22, 1, 51, 23],
    [2, 42, 14, 19, 43, 15],
    [3, 141, 113, 4, 142, 114],
    [3, 70, 44, 11, 71, 45],
    [17, 47, 21, 4, 48, 22],
    [9, 39, 13, 16, 40, 14],
    [3, 135, 107, 5, 136, 108],
    [3, 67, 41, 13, 68, 42],
    [15, 54, 24, 5, 55, 25],
    [15, 43, 15, 10, 44, 16],
    [4, 144, 116, 4, 145, 117],
    [17, 68, 42],
    [17, 50, 22, 6, 51, 23],
    [19, 46, 16, 6, 47, 17],
    [2, 139, 111, 7, 140, 112],
    [17, 74, 46],
    [7, 54, 24, 16, 55, 25],
    [34, 37, 13],
    [4, 151, 121, 5, 152, 122],
    [4, 75, 47, 14, 76, 48],
    [11, 54, 24, 14, 55, 25],
    [16, 45, 15, 14, 46, 16],
    [6, 147, 117, 4, 148, 118],
    [6, 73, 45, 14, 74, 46],
    [11, 54, 24, 16, 55, 25],
    [30, 46, 16, 2, 47, 17],
    [8, 132, 106, 4, 133, 107],
    [8, 75, 47, 13, 76, 48],
    [7, 54, 24, 22, 55, 25],
    [22, 45, 15, 13, 46, 16],
    [10, 142, 114, 2, 143, 115],
    [19, 74, 46, 4, 75, 47],
    [28, 50, 22, 6, 51, 23],
    [33, 46, 16, 4, 47, 17],
    [8, 152, 122, 4, 153, 123],
    [22, 73, 45, 3, 74, 46],
    [8, 53, 23, 26, 54, 24],
    [12, 45, 15, 28, 46, 16],
    [3, 147, 117, 10, 148, 118],
    [3, 73, 45, 23, 74, 46],
    [4, 54, 24, 31, 55, 25],
    [11, 45, 15, 31, 46, 16],
    [7, 146, 116, 7, 147, 117],
    [21, 73, 45, 7, 74, 46],
    [1, 53, 23, 37, 54, 24],
    [19, 45, 15, 26, 46, 16],
    [5, 145, 115, 10, 146, 116],
    [19, 75, 47, 10, 76, 48],
    [15, 54, 24, 25, 55, 25],
    [23, 45, 15, 25, 46, 16],
    [13, 145, 115, 3, 146, 116],
    [2, 74, 46, 29, 75, 47],
    [42, 54, 24, 1, 55, 25],
    [23, 45, 15, 28, 46, 16],
    [17, 145, 115],
    [10, 74, 46, 23, 75, 47],
    [10, 54, 24, 35, 55, 25],
    [19, 45, 15, 35, 46, 16],
    [17, 145, 115, 1, 146, 116],
    [14, 74, 46, 21, 75, 47],
    [29, 54, 24, 19, 55, 25],
    [11, 45, 15, 46, 46, 16],
    [13, 145, 115, 6, 146, 116],
    [14, 74, 46, 23, 75, 47],
    [44, 54, 24, 7, 55, 25],
    [59, 46, 16, 1, 47, 17],
    [12, 151, 121, 7, 152, 122],
    [12, 75, 47, 26, 76, 48],
    [39, 54, 24, 14, 55, 25],
    [22, 45, 15, 41, 46, 16],
    [6, 151, 121, 14, 152, 122],
    [6, 75, 47, 34, 76, 48],
    [46, 54, 24, 10, 55, 25],
    [2, 45, 15, 64, 46, 16],
    [17, 152, 122, 4, 153, 123],
    [29, 74, 46, 14, 75, 47],
    [49, 54, 24, 10, 55, 25],
    [24, 45, 15, 46, 46, 16],
    [4, 152, 122, 18, 153, 123],
    [13, 74, 46, 32, 75, 47],
    [48, 54, 24, 14, 55, 25],
    [42, 45, 15, 32, 46, 16],
    [20, 147, 117, 4, 148, 118],
    [40, 75, 47, 7, 76, 48],
    [43, 54, 24, 22, 55, 25],
    [10, 45, 15, 67, 46, 16],
    [19, 148, 118, 6, 149, 119],
    [18, 75, 47, 31, 76, 48],
    [34, 54, 24, 34, 55, 25],
    [20, 45, 15, 61, 46, 16],
  ];

  static getRSBlocks(
    typeNumber: number,
    level: QrErrorCorrectionLevel,
  ): QRRSBlock[] {
    const table =
      QRRSBlock.RS_BLOCK_TABLE[
        (typeNumber - 1) * 4 + ERROR_CORRECTION_TABLE_INDEX[level]
      ];
    if (!table) throw new Error(`bad RS block for type ${typeNumber}`);

    const blocks: QRRSBlock[] = [];
    for (let index = 0; index < table.length; index += 3) {
      const count = table[index];
      const totalCount = table[index + 1];
      const dataCount = table[index + 2];
      for (let block = 0; block < count; block++) {
        blocks.push(new QRRSBlock(totalCount, dataCount));
      }
    }
    return blocks;
  }
}

const PATTERN_POSITION_TABLE: readonly (readonly number[])[] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170],
];

const QRUtil: {
  G15: number;
  G18: number;
  G15_MASK: number;
  getBCHTypeInfo(data: number): number;
  getBCHTypeNumber(data: number): number;
  getBCHDigit(value: number): number;
  getPatternPosition(typeNumber: number): readonly number[];
  getMask(maskPattern: number, row: number, column: number): boolean;
  getErrorCorrectPolynomial(errorCorrectLength: number): QRPolynomial;
  getLengthInBits(typeNumber: number): number;
  getLostPoint(modules: readonly (readonly boolean[])[]): number;
} = {
  G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | 1,

  G18:
    (1 << 12) |
    (1 << 11) |
    (1 << 10) |
    (1 << 9) |
    (1 << 8) |
    (1 << 5) |
    (1 << 2) |
    1,

  G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),

  getBCHTypeInfo(data: number): number {
    let remainder = data << 10;
    while (
      QRUtil.getBCHDigit(remainder) - QRUtil.getBCHDigit(QRUtil.G15) >=
      0
    ) {
      remainder ^=
        QRUtil.G15 <<
        (QRUtil.getBCHDigit(remainder) - QRUtil.getBCHDigit(QRUtil.G15));
    }
    return ((data << 10) | remainder) ^ QRUtil.G15_MASK;
  },

  getBCHTypeNumber(data: number): number {
    let remainder = data << 12;
    while (
      QRUtil.getBCHDigit(remainder) - QRUtil.getBCHDigit(QRUtil.G18) >=
      0
    ) {
      remainder ^=
        QRUtil.G18 <<
        (QRUtil.getBCHDigit(remainder) - QRUtil.getBCHDigit(QRUtil.G18));
    }
    return (data << 12) | remainder;
  },

  getBCHDigit(value: number): number {
    let digit = 0;
    let remaining = value;
    while (remaining !== 0) {
      digit++;
      remaining >>>= 1;
    }
    return digit;
  },

  getPatternPosition(typeNumber: number): readonly number[] {
    return PATTERN_POSITION_TABLE[typeNumber - 1];
  },

  getMask(maskPattern: number, row: number, column: number): boolean {
    switch (maskPattern) {
      case 0:
        return (row + column) % 2 === 0;
      case 1:
        return row % 2 === 0;
      case 2:
        return column % 3 === 0;
      case 3:
        return (row + column) % 3 === 0;
      case 4:
        return (Math.floor(row / 2) + Math.floor(column / 3)) % 2 === 0;
      case 5:
        return ((row * column) % 2) + ((row * column) % 3) === 0;
      case 6:
        return (((row * column) % 2) + ((row * column) % 3)) % 2 === 0;
      case 7:
        return (((row * column) % 3) + ((row + column) % 2)) % 2 === 0;
      default:
        throw new Error(`bad mask pattern: ${maskPattern}`);
    }
  },

  getErrorCorrectPolynomial(errorCorrectLength: number): QRPolynomial {
    let polynomial = new QRPolynomial([1], 0);
    for (let index = 0; index < errorCorrectLength; index++) {
      polynomial = polynomial.multiply(
        new QRPolynomial([1, QRMath.gexp(index)], 0),
      );
    }
    return polynomial;
  },

  getLengthInBits(typeNumber: number): number {
    if (typeNumber < 1 || typeNumber >= 41) {
      throw new Error(`type: ${typeNumber}`);
    }
    return typeNumber < 10 ? 8 : 16;
  },

  getLostPoint(modules: readonly (readonly boolean[])[]): number {
    const size = modules.length;
    let lostPoint = 0;

    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        let sameCount = 0;
        const dark = modules[row][column];
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
          const neighborRow = row + rowOffset;
          if (neighborRow < 0 || neighborRow >= size) continue;
          for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
            const neighborColumn = column + columnOffset;
            if (
              (rowOffset === 0 && columnOffset === 0) ||
              neighborColumn < 0 ||
              neighborColumn >= size
            ) {
              continue;
            }
            if (dark === modules[neighborRow][neighborColumn]) sameCount++;
          }
        }
        if (sameCount > 5) lostPoint += 3 + sameCount - 5;
      }
    }

    for (let row = 0; row < size - 1; row++) {
      for (let column = 0; column < size - 1; column++) {
        const darkCount =
          Number(modules[row][column]) +
          Number(modules[row + 1][column]) +
          Number(modules[row][column + 1]) +
          Number(modules[row + 1][column + 1]);
        if (darkCount === 0 || darkCount === 4) lostPoint += 3;
      }
    }

    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size - 6; column++) {
        if (
          modules[row][column] &&
          !modules[row][column + 1] &&
          modules[row][column + 2] &&
          modules[row][column + 3] &&
          modules[row][column + 4] &&
          !modules[row][column + 5] &&
          modules[row][column + 6]
        ) {
          lostPoint += 40;
        }
      }
    }
    for (let column = 0; column < size; column++) {
      for (let row = 0; row < size - 6; row++) {
        if (
          modules[row][column] &&
          !modules[row + 1][column] &&
          modules[row + 2][column] &&
          modules[row + 3][column] &&
          modules[row + 4][column] &&
          !modules[row + 5][column] &&
          modules[row + 6][column]
        ) {
          lostPoint += 40;
        }
      }
    }

    let darkCount = 0;
    for (const row of modules) {
      for (const dark of row) if (dark) darkCount++;
    }
    const ratio = Math.abs((100 * darkCount) / (size * size) - 50) / 5;
    return lostPoint + ratio * 10;
  },
};

class QRCodeModel {
  private modules: (boolean | null)[][] = [];

  private readonly moduleCount: number;

  private readonly dataList: QR8bitByte[] = [];

  constructor(
    private readonly typeNumber: number,
    private readonly errorCorrectLevel: QrErrorCorrectionLevel,
  ) {
    this.moduleCount = typeNumber * 4 + 17;
    this.dataList.push(new QR8bitByte(""));
  }

  addData(data: QR8bitByte): void {
    this.dataList[0] = data;
  }

  make(): boolean[][] {
    const data = QRCodeModel.createData(
      this.typeNumber,
      this.errorCorrectLevel,
      this.dataList,
    );
    const maskPattern = this.getBestMaskPattern(data);
    this.makeImpl(false, maskPattern, data);
    return this.modules.map((row) => row.map((module) => module === true));
  }

  private makeImpl(
    test: boolean,
    maskPattern: number,
    data: readonly number[],
  ): void {
    this.modules = Array.from({ length: this.moduleCount }, () =>
      new Array<boolean | null>(this.moduleCount).fill(null),
    );
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);
    if (this.typeNumber >= 7) this.setupTypeNumber(test);
    this.mapData(data, maskPattern);
  }

  private setupPositionProbePattern(row: number, column: number): void {
    for (let rowOffset = -1; rowOffset <= 7; rowOffset++) {
      const targetRow = row + rowOffset;
      if (targetRow < 0 || targetRow >= this.moduleCount) continue;
      for (let columnOffset = -1; columnOffset <= 7; columnOffset++) {
        const targetColumn = column + columnOffset;
        if (targetColumn < 0 || targetColumn >= this.moduleCount) continue;
        this.modules[targetRow][targetColumn] =
          (rowOffset >= 0 &&
            rowOffset <= 6 &&
            (columnOffset === 0 || columnOffset === 6)) ||
          (columnOffset >= 0 &&
            columnOffset <= 6 &&
            (rowOffset === 0 || rowOffset === 6)) ||
          (rowOffset >= 2 &&
            rowOffset <= 4 &&
            columnOffset >= 2 &&
            columnOffset <= 4);
      }
    }
  }

  private setupPositionAdjustPattern(): void {
    for (const row of QRUtil.getPatternPosition(this.typeNumber)) {
      for (const column of QRUtil.getPatternPosition(this.typeNumber)) {
        if (this.modules[row][column] !== null) continue;
        for (let rowOffset = -2; rowOffset <= 2; rowOffset++) {
          for (let columnOffset = -2; columnOffset <= 2; columnOffset++) {
            this.modules[row + rowOffset][column + columnOffset] =
              rowOffset === -2 ||
              rowOffset === 2 ||
              columnOffset === -2 ||
              columnOffset === 2 ||
              (rowOffset === 0 && columnOffset === 0);
          }
        }
      }
    }
  }

  private setupTimingPattern(): void {
    for (let row = 8; row < this.moduleCount - 8; row++) {
      if (this.modules[row][6] !== null) continue;
      this.modules[row][6] = row % 2 === 0;
    }
    for (let column = 8; column < this.moduleCount - 8; column++) {
      if (this.modules[6][column] !== null) continue;
      this.modules[6][column] = column % 2 === 0;
    }
  }

  private setupTypeNumber(test: boolean): void {
    const bits = QRUtil.getBCHTypeNumber(this.typeNumber);
    for (let index = 0; index < 18; index++) {
      const dark = !test && ((bits >>> index) & 1) === 1;
      this.modules[Math.floor(index / 3)][(index % 3) + this.moduleCount - 11] =
        dark;
      this.modules[(index % 3) + this.moduleCount - 11][Math.floor(index / 3)] =
        dark;
    }
  }

  private setupTypeInfo(test: boolean, maskPattern: number): void {
    const data =
      (ERROR_CORRECTION_FORMAT_BITS[this.errorCorrectLevel] << 3) | maskPattern;
    const bits = QRUtil.getBCHTypeInfo(data);
    for (let index = 0; index < 15; index++) {
      const dark = !test && ((bits >>> index) & 1) === 1;
      if (index < 6) {
        this.modules[index][8] = dark;
      } else if (index < 8) {
        this.modules[index + 1][8] = dark;
      } else {
        this.modules[this.moduleCount - 15 + index][8] = dark;
      }
    }
    for (let index = 0; index < 15; index++) {
      const dark = !test && ((bits >>> index) & 1) === 1;
      if (index < 8) {
        this.modules[8][this.moduleCount - index - 1] = dark;
      } else if (index < 9) {
        this.modules[8][15 - index] = dark;
      } else {
        this.modules[8][15 - index - 1] = dark;
      }
    }
    this.modules[this.moduleCount - 8][8] = !test;
  }

  private mapData(data: readonly number[], maskPattern: number): void {
    let direction = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;

    for (let column = this.moduleCount - 1; column > 0; ) {
      if (column === 6) column--;
      const rightColumn = column;
      while (true) {
        for (let offset = 0; offset < 2; offset++) {
          const targetColumn = rightColumn - offset;
          if (this.modules[row][targetColumn] !== null) continue;
          let dark =
            byteIndex < data.length &&
            ((data[byteIndex] >>> bitIndex) & 1) === 1;
          if (QRUtil.getMask(maskPattern, row, targetColumn)) dark = !dark;
          this.modules[row][targetColumn] = dark;
          bitIndex--;
          if (bitIndex === -1) {
            byteIndex++;
            bitIndex = 7;
          }
        }

        row += direction;
        if (row < 0 || row >= this.moduleCount) {
          row -= direction;
          direction = -direction;
          break;
        }
      }
      column -= 2;
    }
  }

  private getBestMaskPattern(data: readonly number[]): number {
    let lowestPenalty = 0;
    let bestPattern = 0;
    for (let pattern = 0; pattern < 8; pattern++) {
      this.makeImpl(true, pattern, data);
      const penalty = QRUtil.getLostPoint(
        this.modules.map((row) => row.map((module) => module === true)),
      );
      if (pattern === 0 || lowestPenalty > penalty) {
        lowestPenalty = penalty;
        bestPattern = pattern;
      }
    }
    return bestPattern;
  }

  private static createData(
    typeNumber: number,
    errorCorrectLevel: QrErrorCorrectionLevel,
    dataList: readonly QR8bitByte[],
  ): number[] {
    const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
    const buffer = new QRBitBuffer();
    for (const data of dataList) {
      buffer.put(data.mode, 4);
      buffer.put(data.getLength(), QRUtil.getLengthInBits(typeNumber));
      data.write(buffer);
    }

    const totalDataCount = rsBlocks.reduce(
      (total, block) => total + block.dataCount,
      0,
    );
    const totalDataBits = totalDataCount * 8;
    if (buffer.getLengthInBits() > totalDataBits) {
      throw new Error(
        `code length overflow (${buffer.getLengthInBits()}>${totalDataBits})`,
      );
    }
    if (buffer.getLengthInBits() + 4 <= totalDataBits) buffer.put(0, 4);
    while (buffer.getLengthInBits() % 8 !== 0) buffer.putBit(false);

    while (buffer.getLengthInBits() < totalDataBits) {
      buffer.put(0xec, 8);
      if (buffer.getLengthInBits() < totalDataBits) buffer.put(0x11, 8);
    }
    return QRCodeModel.createBytes(buffer, rsBlocks);
  }

  private static createBytes(
    buffer: QRBitBuffer,
    rsBlocks: readonly QRRSBlock[],
  ): number[] {
    let offset = 0;
    let maxDataCount = 0;
    let maxErrorCount = 0;
    const dataBlocks: number[][] = [];
    const errorBlocks: number[][] = [];

    for (let blockIndex = 0; blockIndex < rsBlocks.length; blockIndex++) {
      const block = rsBlocks[blockIndex];
      const errorCount = block.totalCount - block.dataCount;
      maxDataCount = Math.max(maxDataCount, block.dataCount);
      maxErrorCount = Math.max(maxErrorCount, errorCount);
      const data = buffer.buffer.slice(offset, offset + block.dataCount);
      offset += block.dataCount;
      dataBlocks.push(data);

      const errorPolynomial = QRUtil.getErrorCorrectPolynomial(errorCount);
      const rawPolynomial = new QRPolynomial(
        data,
        errorPolynomial.getLength() - 1,
      );
      const modPolynomial = rawPolynomial.mod(errorPolynomial);
      const errorData = new Array<number>(errorPolynomial.getLength() - 1);
      for (let index = 0; index < errorData.length; index++) {
        const modIndex = index + modPolynomial.getLength() - errorData.length;
        errorData[index] = modIndex >= 0 ? modPolynomial.get(modIndex) : 0;
      }
      errorBlocks.push(errorData);
    }

    const totalCodeCount = rsBlocks.reduce(
      (total, block) => total + block.totalCount,
      0,
    );
    const result: number[] = [];
    for (let index = 0; index < maxDataCount; index++) {
      for (const block of dataBlocks) {
        if (index < block.length) result.push(block[index]);
      }
    }
    for (let index = 0; index < maxErrorCount; index++) {
      for (const block of errorBlocks) {
        if (index < block.length) result.push(block[index]);
      }
    }
    return result.slice(0, totalCodeCount);
  }
}

function getTypeNumber(
  dataLength: number,
  level: QrErrorCorrectionLevel,
): number {
  for (let typeNumber = 1; typeNumber <= 40; typeNumber++) {
    const lengthBits = QRUtil.getLengthInBits(typeNumber);
    const headerBits = 4 + lengthBits;
    if (dataLength >= 2 ** lengthBits) continue;
    const totalDataCount = QRRSBlock.getRSBlocks(typeNumber, level).reduce(
      (total, block) => total + block.dataCount,
      0,
    );
    if (headerBits + dataLength * 8 <= totalDataCount * 8) return typeNumber;
  }
  throw new Error("Too long data");
}

/** Encode text into a QR matrix without touching the DOM. */
export function qrMatrix(
  text: string,
  level: QrErrorCorrectionLevel = "M",
): boolean[][] {
  if (!Object.hasOwn(ERROR_CORRECTION_FORMAT_BITS, level)) {
    throw new RangeError(`Unsupported QR error correction level: ${level}`);
  }

  const data = new QR8bitByte(text);
  const typeNumber = getTypeNumber(data.getLength(), level);
  const model = new QRCodeModel(typeNumber, level);
  model.addData(data);
  return model.make();
}
