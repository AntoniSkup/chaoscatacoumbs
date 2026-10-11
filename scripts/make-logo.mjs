import sharp from "sharp";

const SOURCE = process.argv[2];

// Lift the lettering off its black backdrop: alpha comes from pixel brightness,
// so the rose/metallic gradient keeps its glow on any dark surface.
const trimmed = await sharp(SOURCE)
  .trim({ background: "#000000", threshold: 12 })
  .png()
  .toBuffer();

const alpha = await sharp(trimmed)
  .removeAlpha()
  .toColourspace("b-w")
  .linear(1.35, 0)
  .toBuffer();

await sharp(trimmed)
  .removeAlpha()
  .joinChannel(alpha)
  .png({ compressionLevel: 9 })
  .toFile("public/logo.png");

const logo = await sharp("public/logo.png")
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = logo.info;
console.log(`logo.png ${width}x${height}`);

// The full lockup is unreadable at favicon sizes, so the tab icon is the serif
// "C" monogram — the first ink column run, measured rather than hardcoded so a
// new source image still lands on the right glyph.
const ON = 400;
const columnInk = (x, fromY, toY) => {
  let sum = 0;
  for (let y = fromY; y < toY; y++) sum += logo.data[(y * width + x) * channels + 3];
  return sum;
};

let left = 0;
while (left < width && columnInk(left, 0, height) <= ON) left++;
let right = left;
while (right < width && columnInk(right, 0, height) > ON) right++;

let top = 0;
while (top < height && rowInk(top) <= ON) top++;
let bottom = height - 1;
while (bottom > top && rowInk(bottom) <= ON) bottom--;

function rowInk(y) {
  let sum = 0;
  for (let x = left; x < right; x++) sum += logo.data[(y * width + x) * channels + 3];
  return sum;
}

const ICON = 256;
const PAD = 28;

await sharp("public/logo.png")
  .extract({ left, top, width: right - left, height: bottom - top + 1 })
  .resize(ICON - PAD * 2, ICON - PAD * 2, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .extend({
    top: PAD,
    bottom: PAD,
    left: PAD,
    right: PAD,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .flatten({ background: { r: 5, g: 5, b: 5 } })
  .png()
  .toFile("src/app/icon.png");

console.log(
  `icon.png ${ICON}x${ICON} (monogram from ${left},${top} ${right - left}x${bottom - top + 1})`,
);
