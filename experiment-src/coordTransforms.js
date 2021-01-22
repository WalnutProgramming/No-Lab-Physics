import Vector from "./vector.js";

// top left position of canvas in pixels
export const pixelOffset = () => new Vector(0, 0);
// ratio of pixels to original
export const pixelScale = () => 1;

export function coordToPixels(/** @type {Vector} */ vec) {
	return vec.mult(pixelScale()).add(pixelOffset());
}

export function pixelsToCoord(/** @type {Vector} */ vec) {
	return vec.subt(pixelOffset()).div(pixelScale());
}

export function distToPixels(/** @type {number} */ n) {
	return n * pixelScale();
}

export function pixelsToDist(/** @type {number} */ n) {
	return n / pixelScale();
}
