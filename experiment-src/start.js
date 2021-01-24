import {
	canvasHeight,
	canvasWidth,
	ctx,
	recordMousePos,
	canvasScope,
	getMousePos,
	canvas,
} from "./canvas.js";
import { distToPixels, pixelsToCoord } from "./coordTransforms.js";
import { Ruler } from "./objects.js";
import Vector from "./vector.js";
import {
	getManifold,
	positionalCorrection,
	resolveCollision,
} from "./collisions.js";
import { getSerializedUrl } from "./serialization.js";
import { cloneDeep } from "https://cdn.skypack.dev/pin/lodash-es@v4.17.20-OGqVe1PSWaO3mr3KWqgK/min/lodash-es.js";

// 60 frames per second
const fps = 60;

export default function start({
	getInitialState,
	getSelectedIds = () => [],
	onObjectSelected = () => {},
	isCreating = false,
}) {
	let userState = {
		paused: false,
		ruler: new Ruler(),
	};

	//handles collisions between objects (but not walls)
	function handleCollisions(state) {
		const { allObjects } = state;
		// loop through every pair of objects
		for (let index1 = 0; index1 < allObjects.length; index1++) {
			for (let index2 = index1 + 1; index2 < allObjects.length; index2++) {
				let object1 = allObjects[index1];
				let object2 = allObjects[index2];
				let manifold = getManifold(object1, object2);
				if (manifold /* are objects colliding? */) {
					positionalCorrection(manifold);
					manifold = getManifold(object1, object2);
					if (manifold) {
						resolveCollision(manifold);
					}
				}
			}
		}
	}

	function update(state) {
		//for each object in the array of them
		state.allObjects.forEach((e) => {
			if (e.hasGravity) {
				//apply a abitrary gravity
				let gravity = new Vector(0, 0.3);
				//gravity not based on mass so multiply it so it will be divided out later
				gravity = gravity.mult(e.mass);
				e.applyForce(gravity);
			}

			//if mouse is pressed (see mousePressed and mouseReleased) apply wind
			// if(isMouseBeingPressed){
			// 	let wind = new Vector(0.2,0);
			// 	e.applyForce(wind);
			// }

			friction(e, -0.05);

			e.update();
		});

		handleCollisions(state);
	}

	//loops "constantly" to apply forces and have objects draw themselves
	function draw(state) {
		// console.log(deserialize(serialize(state)))
		canvasScope(() => {
			ctx.fillRect(
				0,
				0,
				distToPixels(canvasWidth()),
				distToPixels(canvasHeight())
			);

			const selectedIds = getSelectedIds();
			state.allObjects.forEach((object) => {
				canvasScope(() => {
					object.draw(selectedIds.includes(object.id));
				});
			});

			if (userState.ruler.shown) {
				canvasScope(() => {
					userState.ruler.draw();
				});
			}
		});
	}

	let states;
	let stateInd;

	function generateNextState() {
		const lastState = cloneDeep(states[states.length - 1]);
		update(lastState);
		states.push(lastState);
	}
	function resetAndRandomizeStates(shouldUnpause = true) {
		stateInd = 0;
		if (shouldUnpause) {
			userState.paused = false;
		}
		states = [getInitialState()];

		if (!(isCreating && userState.paused)) {
			// precalculate states
			const startTime = Date.now();
			const maxFramesToPrecalculate = isCreating ? 2 * fps : 30 * fps;
			const maxTimeToPrecalculate = isCreating ? 14 : 100;
			while (
				states.length < maxFramesToPrecalculate &&
				Date.now() - startTime < maxTimeToPrecalculate
			) {
				generateNextState();
			}
		}
	}
	window.restart = resetAndRandomizeStates;
	resetAndRandomizeStates();
	document.getElementById("loading-experiment").innerHTML = "";

	let maxFrameReached = 1;
	function sliderFrameLength() {
		const interval = 30 * fps;
		return Math.ceil((maxFrameReached + 1 * fps) / interval) * interval;
	}

	function showTime() {
		const seconds = stateInd / 60;
		const secondsFloored = Math.floor(seconds);
		const secondsFlooredStr = secondsFloored.toString().padStart(3, "0");
		const milliseconds = Math.floor((seconds % 1) * 1000);
		const millisecondsStr = milliseconds.toString().padStart(3, "0");
		document.getElementById(
			"time"
		).innerText = `${secondsFlooredStr}.${millisecondsStr}`;

		timeSlider.value = stateInd / sliderFrameLength();
	}

	const timeSlider = document.getElementById("time-slider");
	timeSlider.value = 0;
	setInterval(() => {
		maxFrameReached = Math.max(maxFrameReached, stateInd);
		if (states.length - stateInd < 10 * fps) {
			for (let i = 0; i < 3; i++)	generateNextState();
		}
		while (states.length - stateInd < 0.2 * fps) {
			generateNextState();
		}
		if (!userState.paused) {
			stateInd++;
		}
		showTime();
		draw(states[stateInd]);
	}, 1000 / 60);
	timeSlider.addEventListener("input", () => {
		stateInd = Math.floor(timeSlider.value * sliderFrameLength());
		showTime();
	});

	const copyLinkToolTip = document.getElementById("copy-link-tooltip");
	document.getElementById("copy-link").addEventListener("click", async () => {
		const text = getSerializedUrl(states[0]);
		try {
			await navigator.clipboard.writeText(text);
			copyLinkToolTip.textContent = "Copied!";
			setTimeout(() => {
				copyLinkToolTip.textContent = "";
			}, 2000);
		} catch (e) {
			copyLinkToolTip.textContent =
				"Failed to copy. Here is the URL for you to copy manually: " +
				getSerializedUrl(states[0]);
		}
	});

	window.addEventListener("hashchange", () => {
		location.reload();
	});

	// draw();

	/* Friction
    
    friction = -1 * M * ||N|| * vel (velocity unit vector)

    Direction of vector???
      = -1 * velocity unit vector

    Magnitude for Friction???
      = M (coefficient of friction) * ||N|| (magnitude of normal force)

    let velocity unit vector = 
      {
        let v = velocity.get()
        v.normalize()
      }

    let ||N|| (normal force) = 1 (ease and it doesn't really matter)

    let M (coefficient of friction) = 0.01 *example* (lots or little friction)

    friction = 
      {
        let friction = vel;
        friction.mult(M);
        friction.mult(||N||); (could remove as ||N|| = 1)
      }
    You can then apply friction with the applyForce function
  */
	//mov is the mover object we want to apply friction to and c is the coefficient of friction
	function friction(mov, c) {
		const f = mov.vel.normalize().mult(c);
		mov.applyForce(f);
	}

	canvas.addEventListener("mousedown", (e) => {
		recordMousePos(e);
		userState.ruler.shape1.pressed();
		userState.ruler.shape2.pressed();
	});

	canvas.addEventListener("mouseup", (e) => {
		recordMousePos(e);
		userState.ruler.shape1.released();
		userState.ruler.shape2.released();
	});

	canvas.addEventListener("click", () => {
		if (stateInd >= states.length) return
		const mousePos = pixelsToCoord(getMousePos());
		for (const object of states[stateInd].allObjects) {
			if (object.containsPoint(mousePos)) {
				onObjectSelected(object.id);
			}
		}
	});

	canvas.addEventListener("mousemove", (e) => {
		recordMousePos(e);
	});

	window.pause = () => {
		userState.paused = !userState.paused;
	};

	window.toggleRuler = () => {
		userState.ruler.shown = !userState.ruler.shown;
	};
}
