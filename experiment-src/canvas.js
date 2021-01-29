import {
	coordToPixels,
	distToPixels,
	pixelsToDist,
} from "./coordTransforms.js";
import Vector from "./vector.js";

/** @type {HTMLCanvasElement} */
export const canvas = document.querySelector("canvas");
const canvasContainer = canvas.parentElement;
export const ctx = canvas.getContext("2d", { alpha: false });
window.ctx = ctx;

const canvasWidthPixels = () => canvasContainer.clientWidth;
const canvasHeightPixels = () => canvasContainer.clientHeight;
export const canvasWidth = () => pixelsToDist(canvasWidthPixels());
export const canvasHeight = () => pixelsToDist(canvasHeightPixels());

function resizeCanvas() {
	canvas.width = canvasWidthPixels();
	canvas.height = canvasHeightPixels();
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/**
 * Uses ctx.save() and ctx.restore() to create a "local scope" for the
 * canvas changes made. For example, if you change the stroke color
 * while you're in the "scope," it'll change back once you're outside
 * of scope.
 * @param {() => void} func
 */
export function canvasScope(func) {
	ctx.save();
	try {
		func();
	} finally {
		ctx.restore();
	}
}

/**
 * Draw a rectangle
 * @param {Vector} centerOrig
 * @param {number} widthOrig
 * @param {number} heightOrig
 */
export function rect(centerOrig, widthOrig, heightOrig, { fill = true, stroke = false } = {}) {
	const { x, y } = coordToPixels(centerOrig);
	const width = distToPixels(widthOrig);
	const height = distToPixels(heightOrig);
	ctx.beginPath();
	ctx.rect(x - width / 2, y - height / 2, width, height);
	if (fill) ctx.fill();
	if (stroke) ctx.stroke();
}

/**
 * Draw a circle
 * @param {Vector} centerOrig
 * @param {number} radiusOrig
 */
export function circle(centerOrig, radiusOrig, { fill = true, stroke = false } = {}) {
	const { x, y } = coordToPixels(centerOrig);
	const radius = distToPixels(radiusOrig);
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	if (fill) ctx.fill();
	if (stroke) ctx.stroke();
}

/**
 * Draw a line between 2 points
 * @param {Vector} loc1Orig 
 * @param {Vector} loc2Orig 
 */
export function line(loc1Orig, loc2Orig) {
	const loc1 = coordToPixels(loc1Orig);
	const loc2 = coordToPixels(loc2Orig);
	ctx.beginPath();
	ctx.moveTo(loc1.x, loc1.y);
	ctx.lineTo(loc2.x, loc2.y);
	ctx.stroke();
}

/** @type {MouseEvent} */
let evt;

export function recordMousePos(/** @type {MouseEvent} */ e) {
	evt = e;
}

export function getMousePos() {
	if (!evt) return new Vector(0, 0);
	const rect = canvas.getBoundingClientRect();
	return new Vector(evt.clientX - rect.left, evt.clientY - rect.top);
}

export function mouseX() {
	return getMousePos().x;
}

export function mouseY() {
	return getMousePos().y;
}
