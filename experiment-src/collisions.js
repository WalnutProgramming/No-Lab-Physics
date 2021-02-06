import { BoxMover, CircleMover, PolygonMover } from "./objects.js";
import { constrain } from "./helpers.js";
import Vector from "./vector.js";

export function resolveCollision({ a, b, normal }) {
	let relativeVelocityOfB = b.vel.subt(a.vel);

	let velAlongNormal = relativeVelocityOfB.dot(normal);

	// Don't resolve if objects are moving towards each other
	if (velAlongNormal > 0) return;

	// perfectly elastic -> restitution = 1
	let restitution = 1;

	let impulseScalar = -(1 + restitution) * velAlongNormal;
	impulseScalar /= 1 / a.mass + 1 / b.mass;

	let impulse = normal.mult(impulseScalar);

	// console.log(impulse);

	// Apply impulse
	a.vel = a.vel.subt(impulse.div(a.mass));
	b.vel = b.vel.add(impulse.div(b.mass));
}

// Correcting the position of 2 objects so that they're not inside each other
export function positionalCorrection({ a, b, normal, penetrationDepth }) {
	// How much of the penetration depth to move out at once
	const percent = 0.2;
	// Minimum penetration depth needed to do a correction
	const slop = 0.01;
	let correction = normal
		.mult(Math.max(penetrationDepth - slop, 0))
		.div(1 / a.mass + 1 / b.mass)
		.mult(percent);
	a.loc = a.loc.subt(correction.mult(1 / a.mass));
	b.loc = b.loc.add(correction.mult(1 / b.mass));
}

function getCircleCircleManifold(a, b) {
	// vector from a to b
	let normal = b.loc.subt(a.loc);

	let sumOfRadii = a.radius + b.radius;

	if (normal.magnitudeSquared() > sumOfRadii ** 2) {
		return null;
	}

	let distanceBetweenCenters = normal.magnitude();

	if (distanceBetweenCenters === 0) {
		// Choose arbitrary (but consistent) values
		return {
			a,
			b,
			penetrationDepth: a.radius,
			normal: new Vector(1, 0),
		};
	}

	return {
		a,
		b,
		penetrationDepth: sumOfRadii - distanceBetweenCenters,
		normal: normal.div(distanceBetweenCenters),
	};
}

// returns -1 if n < 0
// returns +1 if n >= 0
function nonZeroSign(n) {
	return n < 0 ? -1 : 1;
}

function getBoxCircleManifold(aBox, bCircle) {
	let circleLocRelative = bCircle.loc.subt(aBox.loc);
	// closest point on box to circle center
	let closest = circleLocRelative.clone();

	let xExtent = aBox.width / 2;
	let yExtent = aBox.height / 2;

	closest.x = constrain(closest.x, -xExtent, xExtent);
	closest.y = constrain(closest.y, -yExtent, yExtent);

	// Is the circle inside the box?
	let inside = circleLocRelative.equals(closest);

	// We need to clamp the circle's center to the closest edge
	if (inside) {
		if (Math.abs(circleLocRelative.x) > Math.abs(circleLocRelative.y)) {
			closest.x = nonZeroSign(closest.x) * xExtent;
		} else {
			closest.y = nonZeroSign(closest.y) * yExtent;
		}
	}

	let normal = circleLocRelative.clone().subt(closest);
	let d = normal.magnitudeSquared();
	let r = bCircle.radius;

	// Early out if the radius is shorter than distance to closest point and
	// Circle not inside the box
	if (d > r * r && !inside) return null;

	normal = normal.normalize();

	// Collision normal needs to be flipped to point outside if circle was
	// inside the box
	if (inside) normal = normal.mult(-1);

	return {
		a: aBox,
		b: bCircle,
		normal,
		penetrationDepth: r - Math.sqrt(d),
	};
}

// https://forum.unity.com/threads/how-do-i-find-the-closest-point-on-a-line.340058/
// see also: https://stackoverflow.com/questions/10983872/distance-from-a-point-to-a-polygon (didn't use)
function nearestPointOnLineToPoint(/** @type {Vector} */ start, /** @type {Vector} */ end, /** @type {Vector} */ pnt)
{
    let line = end.subt(start);
    const len = line.magnitude();
    line = line.normalize();
   
    const v = pnt.subt(start);
    let d = v.dot(line);
    d = constrain(d, 0, len);
    return start.add(line.mult(d));
}

function getPolygonCircleManifold(aPolygon, /** @type {CircleMover} */ bCircle) {
	let circleLocRelative = bCircle.loc/*.subt(aPolygon.loc)*/;
	
	// closest point on polygon to circle center
	let closest
	const center = bCircle.loc
	let minDist = Infinity;
	aPolygon.absolutePointPairs.forEach(([p1, p2]) => {
		const point = nearestPointOnLineToPoint(p1, p2, center);
		const dist = point.distanceTo(center);
		if (dist < minDist) {
			closest = point;
			minDist = dist;
		}
	})

	// Is the circle inside the polygon?
	let inside = aPolygon.containsPoint(bCircle.loc);

	let normal = circleLocRelative.clone().subt(closest);
	let d = normal.magnitudeSquared();
	let r = bCircle.radius;

	// console.log(Math.sqrt(d));

	
	// Early out if the radius is shorter than distance to closest point and
	// Circle not inside the box
	if (d > r * r && !inside) return null;
	
	normal = normal.normalize();

	// Collision normal needs to be flipped to point outside if circle was
	// inside the box
	if (inside) normal = normal.mult(-1);

	// console.log(normal.x, normal.y, r, Math.sqrt(d), r - Math.sqrt(d));

	return {
		a: aPolygon,
		b: bCircle,
		normal,
		penetrationDepth: r - Math.sqrt(d),
	};
}

function getBoxBoxManifold(a, b) {
	let normal = b.loc.subt(a.loc);

	let xOverlap = a.width / 2 + b.width / 2 - Math.abs(normal.x);
	if (xOverlap <= 0) return null;

	let yOverlap = a.height / 2 + b.height / 2 - Math.abs(normal.y);
	if (yOverlap <= 0) return null;

	if (xOverlap < yOverlap) {
		return {
			a,
			b,
			normal: new Vector(nonZeroSign(normal.x), 0),
			penetrationDepth: xOverlap,
		};
	} else {
		return {
			a,
			b,
			normal: new Vector(0, nonZeroSign(normal.y)),
			penetrationDepth: yOverlap,
		};
	}
}

// https://stackoverflow.com/questions/40097896/javascript-polygon-collision-detection
// https://blog.hamaluik.ca/posts/building-a-collision-engine-part-2-2d-penetration-vectors/
// https://www.toptal.com/game/video-game-physics-part-ii-collision-detection-for-solid-objects
function getPolygonPolygonManifold(a, b) {
	console.error("polygon collisions aren't supported yet");
}

function isCircle(obj) {
	return obj instanceof CircleMover;
}

const manifoldFunctions = [
	[BoxMover, BoxMover, getBoxBoxManifold],
	[BoxMover, CircleMover, getBoxCircleManifold],
	[CircleMover, CircleMover, getCircleCircleManifold],
	[PolygonMover, CircleMover, getPolygonCircleManifold],
]

// returns null if not colliding
export function getManifold(a, b) {
	if (a.mass === Infinity && b.mass === Infinity) return null;

	for (const [c1, c2, f] of manifoldFunctions) {
		if (a instanceof c1 && b instanceof c2) {
			return f(a, b);
		} else if (a instanceof c2 && b instanceof c1) {
			return f(b, a);
		}
	}

	return null;
}
