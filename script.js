class Mover {
	constructor({ 
		mass = random(0.5, 3),
		// location is the position of the center of mass
		loc = createVector(random(width),(0.5*height)),
		vel = createVector(0, 0),
		acc = createVector(0, 0),
		hasGravity = true
	}) {
		this.mass = mass;
		this.loc = loc;
		this.vel = vel;
		this.acc = acc;
		this.hasGravity = hasGravity;
	}

	//divides the force by the objects mass then adds to acceleration
	applyForce(f){
		// Note: we use mult(1/) instead of div() because div() doesn't like dividing by Infinity
		let force = f.mult(1 / this.mass);
		this.acc.add(force);
	}

	//updates the object's position and velocity
	update(){
		this.vel.add(this.acc);
		this.loc.add(this.vel);
		//all components of vector multiplied by 0 will become 0 (new net force on frame)
		this.acc.mult(0); 
	}

	// convenience functions
	getVel() {
		return this.vel.copy();
	}

	get x() {
		return this.loc.x;
	}

	get y() {
		return this.loc.y;
	}
}

class BoxMover extends Mover {
	constructor({
		width = random(50, 100),
		height = random(50, 100),
		...options
	} = {}) {
		super(options);
		this.width = width;
		this.height = height;
	}

	show() {
		fill(255);
		noStroke();
		rectMode(CENTER);
		rect(this.x, this.y, this.width, this.height);
	}
}

class CircleMover extends Mover {
	constructor(options = {}) {
		super(options);
	}

	get radius() {
		return this.mass * 10;
	}

	get diameter() {
		return this.radius * 2;
	}

	//draws the spheres on the canvas
	show(){
		fill(255);
		noStroke();
		ellipse(this.loc.x, this.loc.y, this.diameter, this.diameter);
	}

	get min() {
		return {
			x: this.x - this.radius,
			y: this.y - this.radius
		};
	}

	get max() {
		return {
			x: this.x + this.radius,
			y: this.y + this.radius
		};
	}
}

let allObjects;
let isMouseBeingPressed = false;
let paused = false;
let canvas;

const getInitialObjects = () => ([
	new CircleMover({ loc: createVector(random(width), 0.25 * height) }),
	new CircleMover(),
	new BoxMover({ loc: createVector(random(width), 0.75 * height) }),
	// floor
	new BoxMover({ 
		loc: createVector(width/2, height), 
		width, 
		height: 10,
		hasGravity: false,
		mass: Infinity
	}),
	// ceiling
	new BoxMover({ 
		loc: createVector(width/2, 0), 
		width, 
		height: 10,
		hasGravity: false,
		mass: Infinity
	}),
	// left wall
	new BoxMover({ 
		loc: createVector(0, height/2), 
		height, 
		width: 10,
		hasGravity: false,
		mass: Infinity
	}),
	// right wall
	new BoxMover({ 
		loc: createVector(width, height/2), 
		height, 
		width: 10,
		hasGravity: false,
		mass: Infinity
	}),
])

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.position(0,0);

	allObjects = getInitialObjects();

	//buttons allow for resets and pausing
	let b1;
	b1 = createButton('Pause');
 	b1.position(width/50, height/20);
 	b1.mousePressed(pause);

 	let b2;
	b2 = createButton('Restart');
 	b2.position(width/50, height/40);
 	b2.mousePressed(restart);
}

//handles collisions between objects (but not walls)
function handleCollisions() {
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
	//allows us to essentially "pause" the draw loop by not actually doing it
	if(paused) return;
	background(0);

	//for each object in the array of them (m)
	allObjects.forEach(e => {
		if (e.hasGravity) {
			//apply a abitrary gravity 
			let gravity = createVector(0,0.3);
			//gravity not based on mass so multiply it so it will be divided out later
			gravity.mult(e.mass);
			e.applyForce(gravity);
		}

		//if mouse is pressed (see mousePressed and mouseReleased) apply wind
		if(isMouseBeingPressed){
			let wind = createVector(0.2,0);
			e.applyForce(wind);	
		}

		friction(e, -0.05);

		//update and show objects
		e.update();
		e.show();
	});

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

//bunch of quality of life functions that could be optimized
function mousePressed() {
	isMouseBeingPressed = true;
}

function mouseReleased() {
	isMouseBeingPressed = false;
}

function pause(){
	paused = !paused;
}

function restart(){
	paused = false;
	allObjects = getInitialObjects();
}

function windowResized() {
   resizeCanvas(windowWidth, windowHeight);
}
