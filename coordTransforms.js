// top right position of canvas in pixels
// we need to make this a function because p5 isn't initialized yet
const pixelOffset = () => createVector(0, 0);
// ratio of pixels to original
const pixelScale = () => 1;

function coordToPixels(vec) {
	return vec.copy().mult(pixelScale()).add(pixelOffset());
}

function pixelsToCoord(vec) {
	return vec.copy().subt(pixelOffset()).div(pixelScale());
}

function distToPixels(n) {
	return n * pixelScale();
}

function pixelsToDist(n) {
	return n / pixelScale();
}

const canvasContainer = document.getElementById('put-canvas-here')

const canvasWidthPixels = () => canvasContainer.clientWidth;
const canvasHeightPixels = () => canvasContainer.clientHeight;
const canvasWidth = () => pixelsToDist(canvasWidthPixels())
const canvasHeight = () => pixelsToDist(canvasHeightPixels())
