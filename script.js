class AABB{

	constructor(){
		this.min = createVector(0,0);
		this.max = createVector(0,0);
	}

}

function AABBvsAABB(a,b){
	if(a.max.x < b.min.x || a.min.x > b.max.x){
		return false
	}
	if(a.max.y < b.min.y || a.min.y > b.max.y){
		return false
	}

	return true
}

function CircleCollision(a,b){
	let r = a.radius + b.radius;
	r *= r;
	return r < (a.x + b.x)^2 + (a.y + b.y)^2;
	console.log("Collision Detected");
}

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
		let v = createVector(0,0);
		v.add(this.vel);
		return v;
	}

	//divides the force by the objects mass then adds to acceleration
	applyForce(f){
		let force = f.div(this.mass);
		this.acc.add(force);
	}

	//updates the object's position and velocity
	update(){
		console.log(this.acc);
		this.vel.add(this.acc);
		this.loc.add(this.vel);
		//all components of vector multiplied by 0 will become 0 (new net force on frame)
		this.acc.mult(0); 
	}

	//draws the spheres on the canvas
	show(){
		fill(255);
		noStroke();
		ellipse(this.loc.x, this.loc.y, this.mass*20, this.mass*20);
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

}

var m;
var mp = false;
var paused = false;
var canvas;

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
	var f = mov.getVel();
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