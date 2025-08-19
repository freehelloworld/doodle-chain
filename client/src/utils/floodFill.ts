function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getPixel(imageData: ImageData, x: number, y: number) {
  if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
    return [-1, -1, -1, -1]; // Out of bounds
  }
  const offset = (y * imageData.width + x) * 4;
  return imageData.data.slice(offset, offset + 4);
}

function setPixel(imageData: ImageData, x: number, y: number, color: { r: number; g: number; b: number; a: number }) {
  const offset = (y * imageData.width + x) * 4;
  imageData.data[offset] = color.r;
  imageData.data[offset + 1] = color.g;
  imageData.data[offset + 2] = color.b;
  imageData.data[offset + 3] = color.a;
}

function colorsMatch(a: number[] | Uint8ClampedArray, b: number[] | Uint8ClampedArray, tolerance = 30) {
  return (
    Math.abs(a[0] - b[0]) < tolerance &&
    Math.abs(a[1] - b[1]) < tolerance &&
    Math.abs(a[2] - b[2]) < tolerance &&
    Math.abs(a[3] - b[3]) < tolerance
  );
}

export function floodFill(ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) {
  const canvas = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const startColor = getPixel(imageData, startX, startY);
  const fillColorRgb = hexToRgb(fillColor);

  if (!fillColorRgb) return;

  const fillColorRgba = { ...fillColorRgb, a: 255 };

  if (colorsMatch(startColor, [fillColorRgba.r, fillColorRgba.g, fillColorRgba.b, fillColorRgba.a])) {
    return; // Clicked on a color that is already the fill color
  }

  const pixelStack = [[startX, startY]];

  while (pixelStack.length) {
    const [x, y] = pixelStack.pop()!;
    const currentColor = getPixel(imageData, x, y);

    if (colorsMatch(currentColor, startColor)) {
      setPixel(imageData, x, y, fillColorRgba);

      if (x > 0) pixelStack.push([x - 1, y]);
      if (x < canvas.width - 1) pixelStack.push([x + 1, y]);
      if (y > 0) pixelStack.push([x, y - 1]);
      if (y < canvas.height - 1) pixelStack.push([x, y + 1]);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
