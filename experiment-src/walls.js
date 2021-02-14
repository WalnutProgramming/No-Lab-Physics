import { canvasHeight, canvasWidth } from "./canvas.js";
import { BoxMover } from "./objects.js";
import Vector from "./vector.js";

const wallWidth = 1000000;

export default function walls() {
	return [
		new BoxMover({
			name: 'Floor',
			loc: new Vector(canvasWidth() / 2, canvasHeight() + wallWidth / 2),
			width: canvasWidth(),
			height: wallWidth,
			hasGravity: false,
			mass: Infinity,
		}),
		new BoxMover({
			name: 'Ceiling',
			loc: new Vector(canvasWidth() / 2, 0 - wallWidth / 2),
			width: canvasWidth(),
			height: wallWidth,
			hasGravity: false,
			mass: Infinity,
		}),
		new BoxMover({
			name: 'Left Wall',
			loc: new Vector(0 - wallWidth / 2, canvasHeight() / 2),
			height: canvasHeight(),
			width: wallWidth,
			hasGravity: false,
			mass: Infinity,
		}),
		new BoxMover({
			name: 'Right Wall',
			loc: new Vector(canvasWidth() + wallWidth / 2, canvasHeight() / 2),
			height: canvasHeight(),
			width: wallWidth,
			hasGravity: false,
			mass: Infinity,
		}),
	];
}
