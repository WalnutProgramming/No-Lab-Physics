import start from "./start.js";

import { random } from "./helpers.js";
import { BoxMover, CircleMover } from "./objects.js";
import Vector from "./vector.js";
import { canvasHeight, canvasWidth } from "./canvas.js";
import walls from "./walls.js";
import { getStateFromUrlHash } from "./serialization.js";

(async () => {
	const urlHashState = await getStateFromUrlHash();

	const getInitialState = () =>
		urlHashState ?? {
			allObjects: [
				...walls(),
				new CircleMover({
					loc: new Vector(random(canvasWidth()), 0.25 * canvasHeight()),
				}),
				new CircleMover(),
				new BoxMover({
					loc: new Vector(random(canvasWidth()), 0.75 * canvasHeight()),
				}),
			],
			hasUniversalGravitation: false,
			universalGravitationalConstant: 0.5,
			hasPlanetGravity: true,
			planetGravity: 0.3,
			hasAirResistance: true,
			dragCoefficient: -0.05,
		};

	start({ getInitialState });
})();
