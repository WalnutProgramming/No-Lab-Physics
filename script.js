let isMouseBeingPressed = false;
let canvas;

const getInitialState = () => ({
	allObjects: [
		new CircleMover({ loc: createVector(random(canvasWidth()), 0.25 * canvasHeight()) }),
		new CircleMover(),
		new BoxMover({ loc: createVector(random(canvasWidth()), 0.75 * canvasHeight()) }),
		// floor
		new BoxMover({ 
			loc: createVector(canvasWidth()/2, canvasHeight()), 
			width, 
			height: 10,
			hasGravity: false,
			mass: Infinity
		}),
		// ceiling
		new BoxMover({ 
			loc: createVector(canvasWidth()/2, 0), 
			width, 
			height: 10,
			hasGravity: false,
			mass: Infinity
		}),
		// left wall
		new BoxMover({ 
			loc: createVector(0, canvasHeight()/2), 
			height, 
			width: 10,
			hasGravity: false,
			mass: Infinity
		}),
		// right wall
		new BoxMover({ 
			loc: createVector(canvasWidth(), canvasHeight()/2), 
			height, 
			width: 10,
			hasGravity: false,
			mass: Infinity
		}),
	],
	paused: false,
	ruler: new Ruler()
})

function setup() {
	canvas = createCanvas(canvasWidthPixels(), canvasHeightPixels());
	// canvas.position(0, 0)
	
	// Move canvas into the #put-canvas-here element
	document.getElementById('put-canvas-here').appendChild(document.querySelector('.p5Canvas'))

	state = getStateFromUrlHash() ?? getInitialState();
}

//handles collisions between objects (but not walls)
function handleCollisions() {
	const { allObjects } = state
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

//loops "constantly" to apply forces and have objects draw themselves
function draw() {

	background(0);

	//for each object in the array of them (m)
	state.allObjects.forEach(e => {
		if(!state.paused){ 
			if (e.hasGravity) {
				//apply a abitrary gravity 
				let gravity = createVector(0,0.3);
				//gravity not based on mass so multiply it so it will be divided out later
				gravity.mult(e.mass);
				e.applyForce(gravity);
			}

			//if mouse is pressed (see mousePressed and mouseReleased) apply wind
			// if(isMouseBeingPressed){
			// 	let wind = createVector(0.2,0);
			// 	e.applyForce(wind);	
			// }

			friction(e, -0.05);

			e.update();
		}
		e.show();
	});

	if(state.ruler.shown){
		state.ruler.draw()
	}

	handleCollisions();
}

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
function friction(mov, c){
	let f = mov.getVel();
	f.normalize();
	f.mult(c);
	mov.applyForce(f);
}

function mousePressed() {
	console.log(state.ruler)
	state.ruler.shape1.pressed();
 	state.ruler.shape2.pressed();
}

function mouseReleased() {
	state.ruler.shape1.released();
	state.ruler.shape2.released();
}

function pause(){
	state.paused = !state.paused;
}

function restart(){
	state = getInitialState();
}

function toggleRuler(){
	state.ruler.shown = !state.ruler.shown;
}

function windowResized() {
	resizeCanvas(canvasWidthPixels(), canvasHeightPixels());
}
