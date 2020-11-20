function isBoxCollision(a,b){
	if(a.max.x < b.min.x || a.min.x > b.max.x){
		return false;
	}
	if(a.max.y < b.min.y || a.min.y > b.max.y){
		return false;
	}

	return true;
}

function isCircleCollision(a,b){
	let r = a.radius + b.radius;
	return r**2 > (a.x - b.x)**2 + (a.y - b.y)**2;
}

// Change this to change the type of collision detection being used
let areObjectsColliding = isCircleCollision;

class Mover{

	constructor(){
		//sets a random mass for testing purposes could have value passed in on creation if needed
		this.mass = random(0.5,3);

		//location randomized for testing and velocity and acceleration set to 0
		this.loc = createVector(random(width),(height/2));
		this.vel = createVector(0,0);
		this.acc = createVector(0,0);
	}

	getVel(){
		return this.vel.copy();
	}

	get x() {
		return this.loc.x;
	}

	get y() {
		return this.loc.y;
	}

	get radius() {
		return this.mass * 10;
	}

	get diameter() {
		return this.radius * 2;
	}

	//divides the force by the objects mass then adds to acceleration
	applyForce(f){
		let force = f.div(this.mass);
		this.acc.add(force);
	}

	//updates the object's position and velocity
	update(){
		this.vel.add(this.acc);
		this.loc.add(this.vel);
		//all components of vector multiplied by 0 will become 0 (new net force on frame)
		this.acc.mult(0); 
	}

	//draws the spheres on the canvas
	show(){
		fill(255);
		noStroke();
		ellipse(this.loc.x, this.loc.y, this.diameter, this.diameter);
	}

	//makes the spheres bouncy on the edges of the window
	edges(){
		if(this.loc.x > width){
			this.vel.x *= -1;
			this.loc.x = width;
		}
		else if(this.loc.x < 0){
			this.vel.x *= -1;
			this.loc.x = 0;
		}
		if(this.loc.y > height){
			this.vel.y *= -1;
			this.loc.y = height;
		}
		else if(this.loc.y < 0){
			vel.y *= -1;
			this.loc.y = 0;
		}

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

	getVelocityAfterCollision(other) {
		let m1 = this.mass;
		let m2 = other.mass;
		let v1 = this.getVel();
		let v2 = other.getVel();
		// https://phys.libretexts.org/Bookshelves/University_Physics/Book%3A_Mechanics_and_Relativity_(Idema)/04%3A_Momentum/4.07%3A_Totally_Elastic_Collisions
		return (
			v1.mult((m1 - m2) / (m1 + m2))
				.add(v2.mult(2 * m2 / (m1 + m2)))
		);
	}
}

let m;
let mp = false;
let paused = false;
let canvas;

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.position(0,0);

	//randomly create 5 moving objects
	m = [];
	for(let i = 0; i < 2; i++){
		let mov = new Mover();
		m.push(mov);
	}

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
	for (let index1 = 0; index1 < m.length; index1++) {
		for (let index2 = index1 + 1; index2 < m.length; index2++) {
			let object1 = m[index1];
			let object2 = m[index2];
			if (areObjectsColliding(object1, object2)) {
				let object1NewVelocity = object1.getVelocityAfterCollision(object2);
				object2.vel = object2.getVelocityAfterCollision(object1);
				object1.vel = object1NewVelocity;
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
	m.forEach(e => {

		//apply a abitrary gravity 
		let gravity = createVector(0,0.3);
		//gravity not based on mass so multiply it so it will be divided out later
		gravity.mult(e.mass);
		e.applyForce(gravity);

		//if mouse is pressed (see mousePressed and mouseReleased) apply wind
		if(mp){
			let wind = createVector(0.2,0);
			e.applyForce(wind);	
		}

		friction(e, -0.05);

		//update object, collide with edges, and show objects
		e.update();
		e.edges();
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
	mp = true;
}

function mouseReleased() {
	mp = false;
}

function pause(){
	paused = !paused;
}

function restart(){
	paused = false;
	m = [];
	for(let i = 0; i < 2; i++){
		let mov = new Mover();
		m.push(mov);
	}
}

function windowResized() {
   resizeCanvas(windowWidth, windowHeight);
}
