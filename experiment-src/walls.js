import { canvasHeight, canvasWidth } from "./canvas.js";
import { BoxMover } from "./objects.js";
import Vector from "./vector.js";

const wallWidth = 1000000;

export default function walls() {
	return [
		// floor
		new BoxMover({
			loc: new Vector(canvasWidth() / 2, canvasHeight() + wallWidth / 2),
			width: canvasWidth(),
			height: wallWidth,
			hasGravity: false,
			mass: Infinity,
		}),
		// ceiling
		new BoxMover({
			loc: new Vector(canvasWidth() / 2, 0 - wallWidth / 2),
			width: canvasWidth(),
			height: wallWidth,
			hasGravity: false,
			mass: Infinity,
		}),
		// left wall
		new BoxMover({
			loc: new Vector(0 - wallWidth / 2, canvasHeight() / 2),
			height: canvasHeight(),
			width: wallWidth,
			hasGravity: false,
			mass: Infinity,
		}),
		// right wall
		new BoxMover({
			loc: new Vector(canvasWidth() + wallWidth / 2, canvasHeight() / 2),
			height: canvasHeight(),
			width: wallWidth,
			hasGravity: false,
			mass: Infinity,
		}),
	];
}
