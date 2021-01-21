import {
	ctx,
	canvasWidth,
	canvasHeight,
	circle,
	rect,
	line,
	canvasScope,
	mouseY,
	mouseX,
} from "./canvas.js";
import {
	coordToPixels,
	pixelsToCoord,
	pixelsToDist,
} from "./coordTransforms.js";
import { random } from "./helpers.js";
import Vector from "./vector.js";

export class Mover {
	constructor({
		mass = random(0.5, 3),
		// location is the position of the center of mass
		loc = new Vector(random(canvasWidth()), 0.5 * canvasHeight()),
		vel = new Vector(0, 0),
		acc = new Vector(0, 0),
		hasGravity = true,
	}) {
		this.mass = mass;
		this.loc = loc;
		this.vel = vel;
		this.acc = acc;
		this.hasGravity = hasGravity;
	}

	//divides the force by the objects mass then adds to acceleration
	applyForce(f) {
		// Note: we use mult(1/) instead of div() because div() doesn't like dividing by Infinity
		let force = f.div(this.mass);
		this.acc = this.acc.add(force);
	}

	//updates the object's position and velocity
	update() {
		this.vel = this.vel.add(this.acc);
		this.loc = this.loc.add(this.vel);
		//all components of vector multiplied by 0 will become 0 (new net force on frame)
		this.acc = new Vector(0, 0);
	}

	get x() {
		return this.loc.x;
	}

	get y() {
		return this.loc.y;
	}
}

export class BoxMover extends Mover {
	constructor({
		width = random(50, 100),
		height = random(50, 100),
		...options
	} = {}) {
		super(options);
		this.width = width;
		this.height = height;
	}

	draw() {
		ctx.fillStyle = "rgb(255, 255, 255)";
		rect(this.loc, this.width, this.height);
	}
}

export class CircleMover extends Mover {
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
	draw() {
		ctx.fillStyle = "rgb(255, 255, 255)";

		circle(this.loc, this.radius);
	}

	get min() {
		return {
			x: this.x - this.radius,
			y: this.y - this.radius,
		};
	}

	get max() {
		return {
			x: this.x + this.radius,
			y: this.y + this.radius,
		};
	}
}

export class Draggable {
	constructor(x, y, radius) {
		this.dragging = false;
		this.mouseOver = false;
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.offsetX = 0;
		this.offsetY = 0;
	}

	static fromJSON({ x, y, radius }) {
		return new Draggable(x, y, radius);
	}

	get isMouseOver() {
		let d =
			(this.radius) ** 2 -
			((this.x - mouseX()) ** 2 +
			(this.y - mouseY()) ** 2);
		return d >= 0;
	}

	update() {
		if (this.dragging) {
			this.x = mouseX() + this.offsetX;
			this.y = mouseY() + this.offsetY;
		}
		if (this.x < 0) this.x = 0;
		if (this.y < 0) this.y = 0;
		if (this.x > canvasWidth()) this.x = canvasWidth();
		if (this.y > canvasHeight()) this.y = canvasHeight();
	}

	draw() {
		ctx.strokeStyle = "rgb(0, 0, 0)";
		if (this.dragging) {
			ctx.fillStyle = "rgb(50, 50, 50)";
		} else if (this.isMouseOver) {
			ctx.fillStyle = "rgb(100, 100, 100)";
		} else {
			// fill(175, 200);
			ctx.fillStyle = "rgb(175, 200, 0)";
		}
		circle(new Vector(this.x, this.y), this.radius);
	}

	pressed() {
		if (this.isMouseOver) {
			this.dragging = true;
			this.offsetX = this.x - mouseX();
			this.offsetY = this.y - mouseY();
		}
	}

	released() {
		this.dragging = false;
	}
}

export class Ruler {
	constructor({
		shown = false,
		mainx = canvasWidth() / 2,
		mainy = canvasHeight() / 2,
		shape1 = new Draggable(mainx - mainx / 2, mainy - mainy / 2, 10),
		shape2 = new Draggable(mainx + mainx / 2, mainy + mainy / 2, 10),
	} = {}) {
		this.mainx = mainx;
		this.mainy = mainy;
		this.shape1 = shape1;
		this.shape2 = shape2;
		this.shown = shown;
	}

	draw() {
		this.shape1.update();
		canvasScope(() => {
			this.shape1.draw();
		});
		this.shape2.update();
		canvasScope(() => {
			this.shape2.draw();
		});
		ctx.fillStyle = "rgb(175, 200, 0)";
		// fill(175, 200);
		ctx.strokeStyle = "rgb(255, 255, 255)";

		const coord1 = pixelsToCoord(new Vector(this.shape1.x, this.shape1.y));
		const coord2 = pixelsToCoord(new Vector(this.shape2.x, this.shape2.y));

		line(coord1, coord2);
		// line((this.shape1.x), (this.shape1.y), (this.shape2.x), (this.shape2.y));
		rect(coord1.add(coord2).div(2), pixelsToDist(50), pixelsToDist(50));
		// rect((this.shape1.x + this.shape2.x)/2,(this.shape1.y + this.shape2.y)/2-20, 50, 20)
		let dist = parseInt(
			Math.sqrt(
				Math.pow(this.shape1.x - this.shape2.x, 2) +
					Math.pow(this.shape1.y - this.shape2.y, 2)
			)
		);
		ctx.fillStyle = "rgb(0, 0, 0)";
		// fill(0)
		ctx.font = "16px Arial";
		// textSize(16)
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const { x, y } = coordToPixels(coord1.add(coord2).div(2));
		ctx.fillText(dist.toString(), x, y);
		// text(String(dist),(this.shape1.x + this.shape2.x)/2-15,(this.shape1.y + this.shape2.y)/2-15)
	}
}
