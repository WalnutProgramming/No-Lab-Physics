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

class Draggable {
	constructor(x,y,w,h){
		this.dragging = false;
		this.rollover = false;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.offsetX = 0;
		this.offsetY = 0;
	}

	over(){
		if (mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h) {
	      this.rollover = true;
	    } 
	    else {
	      this.rollover = false;
	    }
	}

	update(){
		if (this.dragging) {
	      this.x = mouseX + this.offsetX;
	      this.y = mouseY + this.offsetY;
	    }
	}

	draw(){
		stroke(0);
	    if (this.dragging) {
	      fill(50);
	    } else if (this.rollover) {
	      fill(100);
	    } else {
	      fill(175, 200);
	    }
	    ellipse(this.x, this.y, this.w, this.h);
	}

	pressed(){
		if (mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h) {
	      this.dragging = true;
	      this.offsetX = this.x - mouseX;
	      this.offsetY = this.y - mouseY;
	    }
	}

	released(){
		this.dragging = false;
	}
}

class Ruler {

	constructor(){
		this.mainx = windowWidth/2;
		this.mainy = windowHeight/2;
		this.shape1 = new Draggable(this.mainx - (this.mainx/2), this.mainy - (this.mainy/2), 10, 10)
		this.shape2 = new Draggable(this.mainx + (this.mainx/2), this.mainy + (this.mainy/2), 10, 10)
	}

	draw(){
		this.shape1.over()
		this.shape1.update()
		this.shape1.draw()
		this.shape2.over()
		this.shape2.update()
		this.shape2.draw()
		stroke(225)
		line((this.shape1.x), (this.shape1.y), (this.shape2.x), (this.shape2.y));
		rect((this.shape1.x + this.shape2.x)/2,(this.shape1.y + this.shape2.y)/2-20, 50, 20)
		let dist = (parseInt(sqrt(pow(this.shape1.x - this.shape2.x,2)+pow(this.shape1.y - this.shape2.y,2))))
		fill(0)
		textSize(16)
		text(String(dist),(this.shape1.x + this.shape2.x)/2-15,(this.shape1.y + this.shape2.y)/2-15)
	}
}


let allObjects;
let isMouseBeingPressed = false;
let paused = false;
let canvas, r;

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

	r = new Ruler();

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

	background(0);

	//for each object in the array of them (m)
	allObjects.forEach(e => {
		if(!paused){ 
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

	r.draw()

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
	r.shape1.pressed();
 	r.shape2.pressed();
}

function mouseReleased() {
	r.shape1.released();
	r.shape2.released();
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
