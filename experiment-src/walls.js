import { canvasHeight, canvasWidth } from "./canvas.js";
import { BoxMover } from "./objects.js";
import Vector from "./vector.js";

export default function walls() {
	return [
		// floor
		new BoxMover({
			loc: new Vector(canvasWidth() / 2, canvasHeight()),
			width: canvasWidth(),
			height: 10,
			hasGravity: false,
			mass: Infinity,
		}),
		// ceiling
		new BoxMover({
			loc: new Vector(canvasWidth() / 2, 0),
			width: canvasWidth(),
			height: 10,
			hasGravity: false,
			mass: Infinity,
		}),
		// left wall
		new BoxMover({
			loc: new Vector(0, canvasHeight() / 2),
			height: canvasHeight(),
			width: 10,
			hasGravity: false,
			mass: Infinity,
		}),
		// right wall
		new BoxMover({
			loc: new Vector(canvasWidth(), canvasHeight() / 2),
			height: canvasHeight(),
			width: 10,
			hasGravity: false,
			mass: Infinity,
		}),
	];
}
