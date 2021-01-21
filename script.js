import {
	canvasHeight,
	canvasWidth,
	ctx,
	recordMousePos,
	canvasScope,
} from "./canvas.js";
import { distToPixels } from "./coordTransforms.js";
import { random } from "./helpers.js";
import { BoxMover, CircleMover, Ruler } from "./objects.js";
import Vector from "./vector.js";
import {
	getManifold,
	positionalCorrection,
	resolveCollision,
} from "./collisions.js";
import { deserialize, serialize } from "./serialization.js";
import { cloneDeep } from "https://cdn.skypack.dev/pin/lodash-es@v4.17.20-OGqVe1PSWaO3mr3KWqgK/min/lodash-es.js";

let isMouseBeingPressed = false;
// let canvas;

const getInitialState = () => ({
	allObjects: [
		new CircleMover({
			loc: new Vector(random(canvasWidth()), 0.25 * canvasHeight()),
		}),
		new CircleMover(),
		new BoxMover({
			loc: new Vector(random(canvasWidth()), 0.75 * canvasHeight()),
		}),
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
	],
});

// let state = /*getStateFromUrlHash() ??*/ getInitialState();
let state;

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
		if (!userState.paused) {
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
		}
	});

	handleCollisions(state);
}

//loops "constantly" to apply forces and have objects draw themselves
function draw() {
	// console.log(deserialize(serialize(state)))
	canvasScope(() => {
		ctx.clearRect(
			0,
			0,
			distToPixels(canvasWidth()),
			distToPixels(canvasHeight())
		);
		ctx.fillRect(
			0,
			0,
			distToPixels(canvasWidth()),
			distToPixels(canvasHeight())
		);

		state.allObjects.forEach((e) => {
			canvasScope(() => {
				e.draw();
			});
		});

		if (userState.ruler.shown) {
			canvasScope(() => {
				userState.ruler.draw();
			});
		}
	});
}

console.log("start");
const states = [getInitialState()];
function generateNextState() {
	const lastState = cloneDeep(states[states.length - 1]);
	update(lastState);
	states.push(lastState);
}
while (states.length < 60 * 60 * 0.5) generateNextState();
console.log("done");
document.getElementById("loading-experiment").innerHTML = "";

const timeSlider = document.getElementById("time-slider");
timeSlider.value = 0;

let statesInd = 0;
function showTime() {
	const seconds = statesInd / 60;
	const secondsFloored = Math.floor(seconds);
	const secondsFlooredStr = secondsFloored.toString().padStart(3, "0");
	const milliseconds = Math.floor((seconds % 1) * 1000);
	const millisecondsStr = milliseconds.toString().padStart(3, "0");
	document.getElementById(
		"time"
	).innerText = `${secondsFlooredStr}:${millisecondsStr}`;
}

setInterval(() => {
	if (states.length - statesInd < 60) {
		for (let i = 0; i < 60 * 20; i++) generateNextState();
	}
	if (!userState.paused) {
		statesInd++;
		showTime();
		timeSlider.value = statesInd / states.length;
	}
	state = states[statesInd];
	draw();
}, 1000 / 60);
timeSlider.addEventListener("input", () => {
	statesInd = Math.floor(timeSlider.value * states.length);
	showTime();
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

window.addEventListener("mousedown", (e) => {
	recordMousePos(e);
	userState.ruler.shape1.pressed();
	userState.ruler.shape2.pressed();
});

window.addEventListener("mouseup", (e) => {
	recordMousePos(e);
	userState.ruler.shape1.released();
	userState.ruler.shape2.released();
});

window.addEventListener("mousemove", (e) => {
	recordMousePos(e);
	userState.ruler.shape1.mousedOver();
	userState.ruler.shape2.mousedOver();
});

window.pause = () => {
	userState.paused = !userState.paused;
};

window.restart = () => {
	state = getInitialState();
};

window.toggleRuler = () => {
	userState.ruler.shown = !userState.ruler.shown;
};
