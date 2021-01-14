// top right position of canvas in pixels
// we need to make this a function because p5 isn't initialized yet
export const pixelOffset = () => createVector(0, 0);
// ratio of pixels to original
export const pixelScale = () => 1;

export function coordToPixels(vec) {
  return vec.copy().mult(pixelScale()).add(pixelOffset());
}

export function pixelsToCoord(vec) {
  return vec.copy().subt(pixelOffset()).div(pixelScale());
}

export function distToPixels(n) {
  return n * pixelScale();
}

export function pixelsToDist(n) {
  return n / pixelScale();
}

export const canvasContainer = document.getElementById("put-canvas-here");

export const canvasWidthPixels = () => canvasContainer.clientWidth;
export const canvasHeightPixels = () => canvasContainer.clientHeight;
export const canvasWidth = () => pixelsToDist(canvasWidthPixels());
export const canvasHeight = () => pixelsToDist(canvasHeightPixels());
