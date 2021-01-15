class Mover {
	constructor({ 
		mass = random(0.5, 3),
		// location is the position of the center of mass
		loc = createVector(random(canvasWidth()),(0.5*canvasHeight())),
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
		
		const { x, y } = coordToPixels(this.loc)
		const width = distToPixels(this.width)
		const height = distToPixels(this.height)
		rect(x, y, width, height);
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

		const { x, y } = coordToPixels(this.loc)
		const diameter = distToPixels(this.diameter)
		ellipse(x, y, diameter, diameter);
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
		this.mouseOver = false;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.offsetX = 0;
		this.offsetY = 0;
  }
  
  static fromJSON({x, y, w, h}) {
    return new Draggable(x, y, w, h)
  }

	mousedOver(){
		let d = pow(this.w/2,2) - (pow(this.x - mouseX,2) + pow(this.y - mouseY,2))
		if(d >= 0){
			this.rollover = true;
		}
		else{
			this.rollover = false;
		}
	}

	update(){
		if (this.dragging) {
			this.x = mouseX + this.offsetX;
			this.y = mouseY + this.offsetY;
		}
		if(this.x < 0)
			this.x = 0
		if(this.y < 0)
			this.y = 0
		if(this.x > canvasWidth())
			this.x = canvasWidth()
		if(this.y > canvasHeight())
			this.y = canvasHeight()
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
		let d = pow(this.w/2,2) - (pow(this.x - mouseX,2) + pow(this.y - mouseY,2))
		if(d >= 0){
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
	constructor({
    shown = false,
    mainx = canvasWidth()/2,
    mainy = canvasHeight()/2,
    shape1 = new Draggable(mainx - (mainx/2), mainy - (mainy/2), 20, 20),
    shape2 = new Draggable(mainx + (mainx/2), mainy + (mainy/2), 20, 20),
  } = {}) {
		this.mainx = mainx;
		this.mainy = mainy;
		this.shape1 = shape1;
		this.shape2 = shape2;
		this.shown = shown;
  }

	draw(){
		this.shape1.mousedOver()
		this.shape1.update()
		this.shape1.draw()
		this.shape2.mousedOver()
		this.shape2.update()
		this.shape2.draw()

		fill(175, 200);
		stroke(225)
		line((this.shape1.x), (this.shape1.y), (this.shape2.x), (this.shape2.y));
		rect((this.shape1.x + this.shape2.x)/2,(this.shape1.y + this.shape2.y)/2-20, 50, 20)
		let dist = (parseInt(sqrt(pow(this.shape1.x - this.shape2.x,2)+pow(this.shape1.y - this.shape2.y,2))))
		fill(0)
		textSize(16)
		text(String(dist),(this.shape1.x + this.shape2.x)/2-15,(this.shape1.y + this.shape2.y)/2-15)
	}
}
