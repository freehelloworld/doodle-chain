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

function colorsMatch(a: number[] | Uint8ClampedArray, b: number[] | Uint8ClampedArray, tolerance = 2) {
  return (
    Math.abs(a[0] - b[0]) < tolerance &&
    Math.abs(a[1] - b[1]) < tolerance &&
    Math.abs(a[2] - b[2]) < tolerance &&
    Math.abs(a[3] - b[3]) < tolerance
  );
}

export function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const { width, height, data } = imageData;
    const stack = [];
    const startPos = (y * width + x) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];
    const fillColorRgb = hexToRgb(fillColor);
    if (!fillColorRgb) return;
    const { r: fillR, g: fillG, b: fillB } = fillColorRgb;

    if (
        startR === fillR &&
        startG === fillG &&
        startB === fillB &&
        startA === 255
    ) {
        return;
    }

    stack.push(x, y);

    while (stack.length > 0) {
        const curY = stack.pop()!;
        const curX = stack.pop()!;
        let northY = curY;
        let southY = curY;

        while (northY >= 0 && matchStartColor(northY, curX)) {
            northY--;
        }
        northY++;

        let westX = curX;
        while (westX >= 0 && matchStartColor(northY, westX)) {
            colorPixel(northY, westX);
            if (northY > 0 && matchStartColor(northY - 1, westX)) {
                stack.push(westX, northY - 1);
            }
            if (northY < height - 1 && matchStartColor(northY + 1, westX)) {
                stack.push(westX, northY + 1);
            }
            westX--;
        }

        let eastX = curX + 1;
        while (eastX < width && matchStartColor(northY, eastX)) {
            colorPixel(northY, eastX);
            if (northY > 0 && matchStartColor(northY - 1, eastX)) {
                stack.push(eastX, northY - 1);
            }
            if (northY < height - 1 && matchStartColor(northY + 1, eastX)) {
                stack.push(eastX, northY + 1);
            }
            eastX++;
        }

        for (let i = westX + 1; i < eastX; i++) {
            if (northY > 0 && !matchStartColor(northY - 1, i) && matchStartColor(northY - 1, i - 1)) {
                stack.push(i - 1, northY - 1);
            }
            if (northY < height - 1 && !matchStartColor(northY + 1, i) && matchStartColor(northY + 1, i - 1)) {
                stack.push(i - 1, northY + 1);
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    function matchStartColor(y: number, x: number) {
        const pos = (y * width + x) * 4;
        const tolerance = 30;
        return (
            Math.abs(data[pos] - startR) < tolerance &&
            Math.abs(data[pos + 1] - startG) < tolerance &&
            Math.abs(data[pos + 2] - startB) < tolerance &&
            Math.abs(data[pos + 3] - startA) < tolerance
        );
    }

    function colorPixel(y: number, x: number) {
        const pos = (y * width + x) * 4;
        data[pos] = fillR;
        data[pos + 1] = fillG;
        data[pos + 2] = fillB;
        data[pos + 3] = 255;
    }
}
