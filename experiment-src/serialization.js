import Vector from "./vector.js";
import { Mover, BoxMover, CircleMover, Ruler, Draggable, PolygonMover, RampMover } from "./objects.js";
import serializationClassNameKey from "./serializationClassNameKey.js";

/** The classes that can be serialized and deserialized */
export const classes = {
	Vector,
	Mover,
	BoxMover,
	CircleMover,
	Ruler,
	Draggable,
	PolygonMover,
	RampMover,
};

/**
 * Serialize a state. In order to be serialized correctly, a user-created class:
 * 1. must be part of the classes object (see above)
 * 2. must either
 *    - implement a static fromJSON() method
 *    - accept the object containing its properties as the first argument of its constructor
 * 3. (optional) may implement a toJSON() method. If implemented, one of the property must
 *    be the serializationClassNameKey (above), and the value must be the name of the class as a string. If not implemented,
 *    all of the properties of the object will be serialized.
 * @param {*} state the state object
 * @returns a JSON string
 */
export function serialize(state, { deleteIds = false } = {}) {
	return JSON.stringify(state, (key, value) => {
		if (key === "id" && deleteIds) {
			return undefined;
		}
		if (typeof value === "number" && !isFinite(value)) {
			return "$number::" + value;
		}
		if (
			typeof value === "object" &&
			value?.constructor?.name &&
			Object.keys(classes).includes(value.constructor.name)
		) {
			return { ...value, [serializationClassNameKey]: value.constructor.name };
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
export function deserialize(json) {
	return JSON.parse(json, (_key, value) => {
		if (value === "$number::Infinity") return Infinity;
		if (value === "$number::-Infinity") return -Infinity;
		if (value === "$number::NaN") return NaN;
		if (typeof value === "object" && value != null) {
			// TODO: Delete this later. This is only for backwards compatibility
			// because the serializationClassNameKey used to be $className and $c.
			const className = value[serializationClassNameKey] ?? value.$className ?? value.$c;
			if (Object.keys(classes).includes(className)) {
				delete value[serializationClassNameKey];
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

function getStateFromLongUrlHash() {
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

export function createHashUrl(text) {
	const urlWithoutHash = window.location.href.replace(window.location.hash, '');
	return urlWithoutHash + '#' + encodeURI(text);
}

export function getSerializedUrl(state) {
	return createHashUrl(serialize(state));
}

/**
 * @returns a promise to the state based on the URL hash
 */
export async function getStateFromUrlHash() {
	let ret;

	// See if the URL looks like JSON
	if (decodeURI(window.location.hash).startsWith('#{')) {
		ret = getStateFromLongUrlHash();
	} else if (window.location.hash.length > 1) {
		// Fetch value from id
		try {
			const id = window.location.hash.substring(1);
			const res = await fetch(`/.netlify/functions/experiment-url?id=${id}`, {
				method: "GET",
			});
			const { state } = await res.json();
			if (state) {
				ret = deserialize(JSON.stringify(state));
			}
		} catch (e) {
			console.error("error fetching data: ", e);
		}
	}

	return ret;
}
