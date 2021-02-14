import {
	createApp,
	ref,
	watch,
	computed,
} from "https://unpkg.com/vue@3.0.5/dist/vue.esm-browser.prod.js";
import { CircleMover, RampMover } from "./objects.js";
import {
	classes,
	clone,
	deserialize,
	getStateFromUrlHash,
	serialize,
} from "./serialization.js";
import start from "./start.js";
import walls from "./walls.js";
import { nanoid } from "https://unpkg.com/nanoid@3.1.20/nanoid.js";
import { throttle } from "https://cdn.skypack.dev/pin/lodash-es@v4.17.20-OGqVe1PSWaO3mr3KWqgK/min/lodash-es.js";
import Vector from "./vector.js";

(async () => {
	const creationOptions = ref({
		tools: {
			ruler: false,
		},
	});
	const initialState = ref({
		allObjects: [
			...walls(),
			// new PolygonMover({ absolutePoints: [new Vector(100, 500), new Vector(100, 600), new Vector(600, 600)] }),
			new RampMover({ loc: new Vector(300, 540) }),
			new CircleMover(),
		],
		hasUniversalGravitation: false,
		universalGravitationalConstant: 0.5,
		hasPlanetGravity: true,
		planetGravity: 0.3,
		hasAirResistance: true,
		dragCoefficient: -0.05,
	});
	const selectedObjectId = ref();
	if (initialState.value.allObjects.length > 0) {
		selectedObjectId.value =
			initialState.value.allObjects[
				initialState.value.allObjects.length - 1
			].id;
	}

	const stateFromUrlHash = await getStateFromUrlHash();
	if (stateFromUrlHash != null) initialState.value = stateFromUrlHash;

	createApp({
		setup() {
			function addObject() {
				const obj = new CircleMover();
				initialState.value.allObjects.push(obj);
				selectedObjectId.value = obj.id;
			}

			function removeObject(id) {
				initialState.value.allObjects = initialState.value.allObjects.filter(
					(obj) => obj.id !== id
				);
				selectedObjectId.value =
					initialState.value.allObjects[
						initialState.value.allObjects.length - 1
					].id;
			}

			const selectedObjectIndex = computed(() =>
				initialState.value.allObjects.findIndex(
					(o) => o.id === selectedObjectId.value
				)
			);

			const isObjectSelected = computed(() => selectedObjectIndex.value !== -1);

			function nextObject(offset) {
				if (initialState.value.allObjects.length > 0) {
					const len = initialState.value.allObjects.length
					let newIndex = isObjectSelected.value 
						? (selectedObjectIndex.value + offset) % len
						: 0;
					if (newIndex < 0) newIndex += len
					selectedObjectId.value = initialState.value.allObjects[newIndex].id;
				}
			}

			return {
				initialState,
				creationOptions,
				initialState,
				addObject,
				removeObject,
				nextObject,
				selectedObjectIndex,
				isObjectSelected,
			};
		},
		template: /* HTML */ `
			<form>
				<!-- <tools-form v-model="creationOptions.tools" /> -->
				<!-- <div v-for="(object, i) in initialState.allObjects" :key="object.id">
					<button type="button" @click="removeObject(object.id)">
						Remove this object
					</button>
					<mover-form v-model="initialState.allObjects[i]" />
				</div>
				<button type="button" @click="addObject">+</button> -->
				<div>
					<div>
						<button type="button" @click="nextObject(-1)">&lt; Previous object</button>
						<button type="button" @click="nextObject(1)">Next object &gt;</button>
					</div>
					<div>
						<button type="button" @click="addObject">Add object</button>
					</div>
					<button
						v-if="isObjectSelected"
						type="button"
						@click="removeObject(initialState.allObjects[selectedObjectIndex].id)"
					>
						Remove this object
					</button>
					<mover-form
						v-if="isObjectSelected"
						v-model="initialState.allObjects[selectedObjectIndex]"
					/>
				</div>
				<h2 style="margin-bottom: 0.5rem">Global Settings</h2>
				<div style="display: flex; flex-direction: column; gap: 1rem">
					<div>
						<input v-model="initialState.hasPlanetGravity" id="planetGravity" type="checkbox" />
						<label for="planetGravity">Global downward gravity?</label>
						<label style="display: block; margin-left: 1.5rem" v-show="initialState.hasPlanetGravity">
							g = <number-input v-model="initialState.planetGravity" />
						</label>
					</div>
					<div>
						<input v-model="initialState.hasAirResistance" id="hasAirResistance" type="checkbox" />
						<label for="hasAirResistance">Air resistance?</label>
						<label style="display: block; margin-left: 1.5rem" v-show="initialState.hasAirResistance">
							Drag coefficient = <number-input v-model="initialState.dragCoefficient" />
						</label>
					</div>
					<div>
						<input v-model="initialState.hasUniversalGravitation" id="globalGravity" type="checkbox" />
						<label for="globalGravity">Gravity between objects?</label>
						<label style="display: block; margin-left: 1.5rem" v-show="initialState.hasUniversalGravitation">
							G = <number-input v-model="initialState.universalGravitationalConstant" />
						</label>
					</div>
				</div>
			</form>
		`,
	})
		.component("tools-form", {
			props: ["modelValue"],
			template: /* HTML */ `
				<p>Tools</p>
				<div>
					<input
						type="checkbox"
						id="ruler"
						value="ruler"
						v-model="modelValue.ruler"
					/>
					<label for="ruler">Ruler</label>
				</div>
			`,
		})
		.component("mover-form", {
			props: ["modelValue"],
			computed: {
				className: {
					get() {
						return this.modelValue.constructor.name;
					},
					set(newClassName) {
						this.$emit(
							"update:modelValue",
							new classes[newClassName](this.modelValue)
						);
					},
				},
			},
			template: /* HTML */ `
				<!-- prettier-ignore -->
				<div style="display: flex; flex-direction: column; gap: 1rem">
					<label>
						Object Type
						<select v-model="className">
							<option value="CircleMover">Circle</option>
							<option value="BoxMover">Rectangle</option>
							<option value="RampMover">Ramp</option>
						</select>
					</label>
					<p v-if="modelValue.loc != null">Initial Position: <vector-form v-model="modelValue.loc" /> </p>
					<p v-if="modelValue.vel != null">Initial Velocity: <vector-form v-model="modelValue.vel" /> </p>
					<div v-if="modelValue.radius || modelValue.diameter" style="display: flex; flex-direction: column">
						<label v-if="modelValue.radius != null">Radius: <number-input v-model="modelValue.radius" /></label>
						<label v-if="modelValue.diameter != null">Diameter: <number-input v-model="modelValue.diameter" /></label>
					</div>
					<div v-if="modelValue.width || modelValue.height" style="display: flex; flex-direction: column">
						<label v-if="modelValue.width != null">Width: <number-input v-model="modelValue.width" /></label>
						<label v-if="modelValue.height != null">Height: <number-input v-model="modelValue.height" /></label>
					</div>
					<label v-if="modelValue.mass != null">Mass: <number-input v-model="modelValue.mass" allow-infinity /></label>
					<label v-if="modelValue.hasGravity != null"><input type="checkbox" v-model="modelValue.hasGravity" /> Affected by gravity</label>
				</div>
			`,
		})
		.component("vector-form", {
			props: ["modelValue"],
			template: /* HTML */ `
				<div style="display: flex; flex-wrap: wrap; margin-left: 1rem">
					<label> X: <number-input v-model="modelValue.x" /> </label>
					<label> Y: <number-input v-model="modelValue.y" /> </label>
				</div>
			`,
		})
		.component("number-input", {
			props: {
				modelValue: { type: Number, required: false },
				allowInfinity: Boolean,
			},
			setup(props, { emit }) {
				const id = nanoid();

				const showValue = computed({
					get() {
						return props.modelValue;
					},
					set(newVal) {
						if (typeof newVal === "number") emit("update:modelValue", newVal);
					},
				});

				let oldFiniteValue = 1;
				const isInfinite = computed({
					get() {
						return props.modelValue === Infinity;
					},
					set(shouldBeInfinite) {
						if (shouldBeInfinite) {
							oldFiniteValue = props.modelValue;
							emit("update:modelValue", Infinity);
						} else emit("update:modelValue", oldFiniteValue);
					},
				});

				return { showValue, isInfinite, id };
			},
			template: /* HTML */ `
				<input
					type="number"
					step="any"
					v-model.number="showValue"
					:disabled="isInfinite"
				/>
				<div v-if="allowInfinity || isInfinite" style="padding-left: 1rem">
					<input :id="id" :name="id" type="checkbox" v-model="isInfinite" />
					<label :for="id">Infinite</label>
				</div>
			`,
		})
		.mount("#vue-app");

	start({
		getInitialState() {
			const state = clone(initialState.value);
			return state;
		},
		getSelectedIds() {
			return selectedObjectId.value ? [selectedObjectId.value] : [];
		},
		onObjectSelected(id) {
			selectedObjectId.value = id;
		},
		editInitialState(newInitialState) {
			initialState.value = clone(newInitialState);
		},
		isCreating: true,
	});
	watch(
		initialState,
		throttle(() => window.restart(false), 16),
		{ deep: true }
	);

	// COPYING AND PASTING PHYSICS OBJECTS

	let lastClickWasInsideCanvas = false;

	window.addEventListener("click", (e) => {
		lastClickWasInsideCanvas = e.target instanceof HTMLCanvasElement;
	});

	function shouldAllowCopyingAndPastingPhysicsObjects() {
		return (
			lastClickWasInsideCanvas &&
			(document.activeElement instanceof HTMLBodyElement ||
				document.activeElement instanceof HTMLCanvasElement)
		);
	}

	function maybeCopyPhysicsObject(
		/** @type {ClipboardEvent} */ e,
		cut = false
	) {
		if (!shouldAllowCopyingAndPastingPhysicsObjects()) return;

		const selection = document.getSelection();
		// If they're actually trying to copy some text, don't interfere
		if (
			selection.type !== "Range" &&
			selection.toString() === "" &&
			selectedObjectId.value
		) {
			const selectedObject = initialState.value.allObjects.find(
				(o) => o.id === selectedObjectId.value
			);
			e.preventDefault();
			e.clipboardData.setData(
				"physics-object",
				serialize(selectedObject, { deleteIds: true })
			);
			if (cut) {
				initialState.value.allObjects = initialState.value.allObjects.filter(
					({ id }) => id !== selectedObjectId.value
				);
				selectedObjectId.value = undefined;
			}
		}
	}

	window.addEventListener("copy", (/** @type {ClipboardEvent} */ e) => {
		maybeCopyPhysicsObject(e);
	});

	window.addEventListener("cut", (/** @type {ClipboardEvent} */ e) => {
		maybeCopyPhysicsObject(e, true);
	});

	window.addEventListener("paste", (/** @type {ClipboardEvent} */ e) => {
		if (!shouldAllowCopyingAndPastingPhysicsObjects()) return;

		const data = e.clipboardData.getData("physics-object");
		if (data && data !== "") {
			const obj = deserialize(data);

			// Adjust x position of object until it's not on top of another object.
			// This algorithm could be improved.
			while (
				initialState.value.allObjects.find(
					(otherObj) =>
						obj.loc.x === otherObj.loc.x && obj.loc.y === otherObj.loc.y
				)
			) {
				obj.loc.x += 50;
			}

			initialState.value.allObjects.push(obj);
			selectedObjectId.value = obj.id;
		}
	});
})();
