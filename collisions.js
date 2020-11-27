function resolveCollision({ a, b, normal }) {
	let relativeVelocityOfB = b.getVel().sub(a.getVel());

	let velAlongNormal = relativeVelocityOfB.dot(normal);

	// Don't resolve if objects are moving towards each other
	if (velAlongNormal > 0) return;

	// perfectly elastic -> restitution = 1
	let restitution = 1;

	let impulseScalar = -(1 + restitution) * velAlongNormal;
	impulseScalar /= 1 / a.mass + 1 / b.mass;

    let impulse = normal.mult(impulseScalar);

    // Apply impulse
	a.vel.sub(impulse.copy().mult(1 / a.mass));
	b.vel.add(impulse.copy().mult(1 / b.mass));
}

// Correcting the position of 2 objects so that they're not inside each other
function positionalCorrection({ a, b, normal, penetrationDepth }) {
    // How much of the penetration depth to move out at once
    const percent = 0.2;
    // Minimum penetration depth needed to do a correction
    const slop = 0.01;
	let correction = normal
		.copy()
        .mult(Math.max(penetrationDepth - slop, 0))
		.div(1/a.mass + 1/b.mass)
        .mult(percent);
	a.loc.sub(correction.copy().mult(1 / a.mass));
	b.loc.add(correction.copy().mult(1 / b.mass));
}

// returns null if not colliding
function getManifold(a, b) {
    if (a.mass === Infinity && b.mass === Infinity) return null;

    return (
         isCircle(a) &&  isCircle(b) ? getCircleCircleManifold(a, b) :
         isCircle(a) && !isCircle(b) ? getCircleBoxManifold(b, a) :
        !isCircle(a) &&  isCircle(b) ? getCircleBoxManifold(a, b) :
        !isCircle(a) && !isCircle(b) ? getBoxBoxManifold(a, b) :
        null
    );
}

function getCircleCircleManifold(a, b) {
    // vector from a to b
    let normal = b.loc.copy().sub(a.loc)

    let sumOfRadii = (a.radius + b.radius);

    if (normal.magSq() > sumOfRadii**2) {
        return null;
    }

    let distanceBetweenCenters = normal.mag();

    if (distanceBetweenCenters === 0) {
        // Choose arbitrary (but consistent) values
        return { 
            a, 
            b, 
            penetrationDepth: a.radius, 
            normal: createVector(1, 0) 
        };
    }

    return {
        a,
        b,
        penetrationDepth: sumOfRadii - distanceBetweenCenters,
        normal: normal.copy().div(distanceBetweenCenters)
    };
}

// returns -1 if n < 0
// returns +1 if n >= 0
function nonZeroSign(n) {
    return n < 0 ? -1 : 1;
}

function getCircleBoxManifold(aBox, bCircle) {
    let circleLocRelative = bCircle.loc.copy().sub(aBox.loc);
    // closest point on box to circle center
    let closest = circleLocRelative.copy();

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

    let normal = circleLocRelative.copy().sub(closest);
    let d = normal.magSq();
    let r = bCircle.radius;

    // Early out if the radius is shorter than distance to closest point and
    // Circle not inside the box
    if(d > r * r && !inside) return null;

    normal.normalize();

    // Collision normal needs to be flipped to point outside if circle was
    // inside the box
    if (inside) normal.mult(-1);

    return (
        {
            a: aBox,
            b: bCircle,
            normal,
            penetrationDepth: r - Math.sqrt(d),
        }
    )
}

function getBoxBoxManifold(a, b) {
    let normal = b.loc.copy().sub(a.loc);
    
    let xOverlap = a.width/2 + b.width/2 - Math.abs(normal.x);
    if (xOverlap <= 0) return null;
    
    let yOverlap = a.height/2 + b.height/2 - Math.abs(normal.y)
    if (yOverlap <= 0) return null;

    if (xOverlap < yOverlap) {
        return {
            a,
            b,
            normal: createVector(nonZeroSign(normal.x), 0),
            penetrationDepth: xOverlap
        }
    } else {
        return {
            a,
            b,
            normal: createVector(0, nonZeroSign(normal.y)),
            penetrationDepth: yOverlap
        }
    }
}

function isCircle(obj) {
    return obj instanceof CircleMover;
}
