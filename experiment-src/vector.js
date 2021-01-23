// @ts-check

// from https://github.com/evanw/lightgl.js/blob/master/src/vector.js
/* @license for this file:
Copyright (C) 2011 by Evan Wallace

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

export default class Vector {
	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	toJSON() {
		return {
			$className: "Vector",
			a: this.toArray(),
		};
	}
	static fromJSON({ a }) {
		return this.fromArray(a);
	}

	negative() {
		return new Vector(-this.x, -this.y, -this.z);
	}
	add(/** @type {Vector} */ v) {
		if (v instanceof Vector)
			return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
		else return new Vector(this.x + v, this.y + v, this.z + v);
	}
	subt(/** @type {Vector} */ v) {
		if (v instanceof Vector)
			return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
		else return new Vector(this.x - v, this.y - v, this.z - v);
	}
	mult(/** @type {Vector | number} */ v) {
		if (v instanceof Vector)
			return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
		else return new Vector(this.x * v, this.y * v, this.z * v);
	}
	div(/** @type {Vector | number} */ v) {
		if (v instanceof Vector)
			return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
		else return new Vector(this.x / v, this.y / v, this.z / v);
	}
	equals(/** @type {Vector} */ v) {
		return this.x === v.x && this.y === v.y && this.z === v.z;
	}
	dot(/** @type {Vector} */ v) {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}
	cross(/** @type {Vector} */ v) {
		return new Vector(
			this.y * v.z - this.z * v.y,
			this.z * v.x - this.x * v.z,
			this.x * v.y - this.y * v.x
		);
	}
	magnitudeSquared() {
		return this.dot(this);
	}
	magnitude() {
		return Math.sqrt(this.magnitudeSquared());
	}
	unit() {
		if (this.magnitude() === 0) return this.clone();
		return this.div(this.magnitude());
	}
	normalize() {
		return this.unit();
	}
	min() {
		return Math.min(Math.min(this.x, this.y), this.z);
	}
	max() {
		return Math.max(Math.max(this.x, this.y), this.z);
	}
	toAngles() {
		return {
			theta: Math.atan2(this.z, this.x),
			phi: Math.asin(this.y / this.magnitude()),
		};
	}
	angleTo(/** @type {Vector} */ a) {
		return Math.acos(this.dot(a) / (this.magnitude() * a.magnitude()));
	}
	toArray(n = 3) {
		return [this.x, this.y, this.z].slice(0);
	}
	clone() {
		return new Vector(this.x, this.y, this.z);
	}
	distanceTo(/** @type {Vector} */ vec) {
		return this.subt(vec).magnitude();
	}

	static fromAngles(/** @type {number} */ theta, /** @type {number} */ phi) {
		return new Vector(
			Math.cos(theta) * Math.cos(phi),
			Math.sin(phi),
			Math.sin(theta) * Math.cos(phi)
		);
	}
	static randomDirection() {
		return Vector.fromAngles(
			Math.random() * Math.PI * 2,
			Math.asin(Math.random() * 2 - 1)
		);
	}
	static min(/** @type {Vector} */ a, /** @type {Vector} */ b) {
		return new Vector(
			Math.min(a.x, b.x),
			Math.min(a.y, b.y),
			Math.min(a.z, b.z)
		);
	}
	static max(/** @type {Vector} */ a, /** @type {Vector} */ b) {
		return new Vector(
			Math.max(a.x, b.x),
			Math.max(a.y, b.y),
			Math.max(a.z, b.z)
		);
	}
	static lerp(
		/** @type {Vector} */ a,
		/** @type {Vector} */ b,
		/** @type {number} */ fraction
	) {
		return b.subt(a).mult(fraction).add(a);
	}
	static fromArray(/** @type {[number, number, number]} */ [a, b, c]) {
		return new Vector(a, b, c);
	}
	static angleBetween(a, b) {
		return a.angleTo(b);
	}
}
