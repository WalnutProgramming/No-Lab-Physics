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
    
    // debugger;

    // Apply impulse
	a.vel.sub(impulse.copy().div(a.mass));
	b.vel.add(impulse.copy().div(b.mass));
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
	a.loc.sub(correction.copy().div(a.mass));
	b.loc.add(correction.copy().div(b.mass));
}

// returns null if not colliding
function getCircleCircleManifold(a, b) {
    // vector from a to b
    let normal = b.loc.copy().sub(a.loc)

    let sumOfRadii = (a.radius + b.radius);

    if (normal.magSq() > sumOfRadii**2) {
        return false;
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