// Canvas text doesn't trigger font loading, so wait for this before drawing digits.
export const DIGIT_FONT_FAMILY = '"Geist Mono Variable", monospace';

export function loadDigitFont() {
  return document.fonts.load(`500 16px ${DIGIT_FONT_FAMILY}`);
}

// The digits drawn across the site are real binary: read in order, they spell this message.
const MESSAGE = "Moonflower Labs ";

export const BITS = [...MESSAGE].flatMap((char) =>
  [...char.charCodeAt(0).toString(2).padStart(8, "0")].map(Number),
);

export const DIGIT_LEVELS = 7;

// Pre-rendered 0s and 1s at each brightness: silver rows first, then accent rows.
export function buildDigitAtlas(cellWidth: number, cellHeight: number, silver: string, accent: string) {
  const atlas = document.createElement("canvas");
  atlas.width = cellWidth * 2;
  atlas.height = cellHeight * DIGIT_LEVELS * 2;
  const context = atlas.getContext("2d");
  if (!context) return null;

  context.font = `500 ${Math.round(cellHeight * 0.8)}px ${DIGIT_FONT_FAMILY}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (let level = 0; level < DIGIT_LEVELS * 2; level++) {
    const step = level % DIGIT_LEVELS;
    context.globalAlpha = 0.16 + 0.84 * (step / (DIGIT_LEVELS - 1)) ** 1.4;
    context.fillStyle = level < DIGIT_LEVELS ? silver : accent;
    for (const bit of [0, 1]) {
      context.fillText(String(bit), cellWidth * (bit + 0.5), cellHeight * (level + 0.5));
    }
  }
  return atlas;
}
