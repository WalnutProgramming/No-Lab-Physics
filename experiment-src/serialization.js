import Vector from "./vector.js";
import { Mover, BoxMover, CircleMover, Ruler, Draggable } from "./objects.js";

/** The classes that can be serialized and deserialized */
export const classes = {
	Vector,
	Mover,
	BoxMover,
	CircleMover,
	Ruler,
	Draggable,
};

/**
 * Serialize a state. In order to be serialized correctly, a user-created class:
 * 1. must be part of the classes object (see above)
 * 2. must either
 *    - implement a static fromJSON() method
 *    - accept the object containing its properties as the first argument of its constructor
 * 3. (optional) may implement a toJSON() method. If implemented, one of the property must
 *    be '$className', which is the name of the class as a string. If not implemented,
 *    all of the properties of the object will be serialized.
 * @param {*} state the state object
 * @returns a JSON string
 */
function serialize(state) {
	return JSON.stringify(state, (_key, value) => {
		if (typeof value === "number" && !isFinite(value)) {
			return "$number::" + value;
		}
		if (
			typeof value === "object" &&
			value?.constructor?.name &&
			Object.keys(classes).includes(value.constructor.name)
		) {
			return { ...value, $className: value.constructor.name };
		}
		if (
			typeof value === "object" &&
			value != null &&
			!["Array", "Object"].includes(value.constructor.name)
		) {
			console.warn(
				`Class ${value.constructor.name} isn't part of the classes array. ` +
					`This object may not be deserialized correctly: \n`,
				value
			);
		}
		return value;
	});
}

/**
 * Deserialize a state. See serialize for more details.
 * @param {string} json A JSON string generated with serialize.
 * @returns the state object
 */
function deserialize(json) {
	return JSON.parse(json, (_key, value) => {
		if (value === "$number::Infinity") return Infinity;
		if (value === "$number::-Infinity") return -Infinity;
		if (value === "$number::NaN") return NaN;
		if (typeof value === "object" && value != null) {
			const className = value.$className;
			if (Object.keys(classes).includes(className)) {
				delete value.$className;
				const theClass = classes[className];
				if (theClass.fromJSON) {
					return theClass.fromJSON(value);
				} else {
					const ret = new theClass(value);
					return ret;
				}
			}
		}
		return value;
	});
}

/**
 * @returns a URL link to this page at its current state
 */
export function getStateFromUrlHash() {
	const json = window.location.hash;
	if (json.length === 0) {
		return null;
	}
	try {
		return deserialize(decodeURI(window.location.hash.substring(1)));
	} catch (e) {
		console.error("failed to deserialize", e);
		return null;
	}
}

export function clone(state) {
	return deserialize(serialize(state));
}

export function getSerializedUrl(state) {
	const urlWithoutHash = window.location.href.replace(window.location.hash, '')
	return urlWithoutHash + '#' + encodeURI(serialize(state))
}
