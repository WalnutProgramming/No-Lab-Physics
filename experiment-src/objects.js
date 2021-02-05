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
	distToPixels,
	pixelsToCoord,
	pixelsToDist,
} from "./coordTransforms.js";
import { nanoid } from "https://unpkg.com/nanoid@3.1.20/nanoid.js";
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
		id = nanoid(),
	}) {
		this.mass = mass;
		this.loc = loc;
		this.vel = vel;
		this.acc = acc;
		this.hasGravity = hasGravity;
		this.id = id;
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

	draw(isSelected = false) {
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.strokeStyle = "blue";
		ctx.lineWidth = distToPixels(4);
		rect(this.loc, this.width, this.height, { stroke: isSelected });
	}

	containsPoint(point) {
		if (this.mass < Infinity) {
			window.point = point;
			window.x = this.x;
			window.y = this.y;
			window.height = this.height;
			window.width = this.width;
		}
		if (point.x < this.x - this.width / 2) return false;
		if (point.x > this.x + this.width / 2) return false;
		if (point.y < this.y - this.height / 2) return false;
		if (point.y > this.y + this.height / 2) return false;
		return true;
	}
}

export class CircleMover extends Mover {
	constructor(options = {}) {
		super(options);
		const { radius = this.mass * 10 } = options;
		this.radius = radius;
	}

	get diameter() {
		return this.radius * 2;
	}

	set diameter(newDiameter) {
		this.radius = newDiameter / 2;
	}

	//draws the spheres on the canvas
	draw(isSelected = false) {
		ctx.fillStyle = "rgb(255, 255, 255)";

		ctx.strokeStyle = "blue";
		ctx.lineWidth = distToPixels(6);
		circle(this.loc, this.radius, { stroke: isSelected });
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

	containsPoint(point) {
		return this.loc.distanceTo(point) <= this.radius;
	}
}

function centerOfMassOfPolygonPoints(points) {
	// TODO
	return new Vector(0, 0);
}

// TODO: position doesn't mean anything, but should be center of mass
// points should be relative
export class PolygonMover extends Mover {


	constructor({ points, ...options }) {
		super(options);

		// const centerOfMass = 
		// this.relativePoints = points.map((p) => p.subt(centerOfMass));

		this.points = points;
		this.mass = Infinity;
		this.hasGravity = false;
	}

	get pointsWithFirstDuplicatedAtEnd() {
		return [...this.points, this.points[0]];
	}

	get pointPairs() {
		const ret = [];
		for (let i = 1; i < this.pointsWithFirstDuplicatedAtEnd.length; i++) {
			ret.push([
				this.pointsWithFirstDuplicatedAtEnd[i - 1],
				this.pointsWithFirstDuplicatedAtEnd[i],
			]);
		}
		return ret;
	}

	draw(isSelected = false) {
		ctx.beginPath();
		const initialPoint = coordToPixels(this.points[0])
		ctx.moveTo(initialPoint.x, initialPoint.y);
		for (const point of this.pointsWithFirstDuplicatedAtEnd) {
			const { x, y } = coordToPixels(point);
			ctx.lineTo(x, y);
		}
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.fill();
		if (isSelected) {
			ctx.strokeStyle = "blue";
			ctx.stroke();
		}
	}

	containsPoint(p) {
		const polygon = this.points;

		// https://stackoverflow.com/a/17490923
		let isInside = false;
    let minX = polygon[0].x, maxX = polygon[0].x;
    let minY = polygon[0].y, maxY = polygon[0].y;
    for (let n = 1; n < polygon.length; n++) {
        const q = polygon[n];
        minX = Math.min(q.x, minX);
        maxX = Math.max(q.x, maxX);
        minY = Math.min(q.y, minY);
        maxY = Math.max(q.y, maxY);
    }

    if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
        return false;
    }

    let i = 0, j = polygon.length - 1;
    for (i, j; i < polygon.length; j = i++) {
        if ( (polygon[i].y > p.y) != (polygon[j].y > p.y) &&
                p.x < (polygon[j].x - polygon[i].x) * (p.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x ) {
            isInside = !isInside;
        }
    }

    return isInside;
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
			this.radius ** 2 - ((this.x - mouseX()) ** 2 + (this.y - mouseY()) ** 2);
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

		const coord1 = new Vector(this.shape1.x, this.shape1.y);
		const coord2 = new Vector(this.shape2.x, this.shape2.y);

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
