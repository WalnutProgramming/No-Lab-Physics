import {
	createApp,
	ref,
	watch,
	computed,
} from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import { CircleMover } from "./objects.js";
import {
	classes,
	clone,
	getStateFromUrlHash,
	deserialize,
} from "./serialization.js";
import start from "./start.js";
import walls from "./walls.js";
import { nanoid } from "https://unpkg.com/nanoid@3.1.20/nanoid.js";
import { throttle } from "https://cdn.skypack.dev/pin/lodash-es@v4.17.20-OGqVe1PSWaO3mr3KWqgK/min/lodash-es.js";

(async () => {
	const creationOptions = ref({
		tools: {
			ruler: false,
		},
	});
	const initialState = ref({
		allObjects: [...walls(), new CircleMover()],
	});
	const selectedObjectId = ref();
	if (initialState.value.allObjects.length > 0) {
		selectedObjectId.value =
			initialState.value.allObjects[
				initialState.value.allObjects.length - 1
			].id;
	}

	// See if the URL looks like JSON
	if (decodeURI(window.location.hash).startsWith('#{')) {
		const state = getStateFromUrlHash();
		if (state) initialState.value = state;
	} else if (window.location.hash.length > 1) {
		// Fetch value from id
		try {
			const id = window.location.hash.substring(1);
			const res = await fetch(`/.netlify/functions/experiment-url?id=${id}`, {
				method: "GET",
			});
			const { state } = await res.json();
			if (state) {
				initialState.value = deserialize(JSON.stringify(state));
			}
		} catch (e) {
			console.error("error fetching data: ", e);
		}
	}

	window.testClipboardCopy = () => {
		navigator.clipboard.writeText("<empty clipboard>")
	}

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
				selectedObjectId.value = undefined;
			}

			const selectedObjectIndex = computed(() =>
				initialState.value.allObjects.findIndex(
					(o) => o.id === selectedObjectId.value
				)
			);

			const isObjectSelected = computed(() => selectedObjectIndex.value !== -1);

			return {
				creationOptions,
				initialState,
				addObject,
				removeObject,
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
			console.log(state);
			return state;
		},
		getSelectedIds() {
			return selectedObjectId.value ? [selectedObjectId.value] : [];
		},
		onObjectSelected(id) {
			selectedObjectId.value = id;
		},
		isCreating: true,
	});
	watch(
		initialState,
		throttle(() => window.restart(false), 16),
		{ deep: true }
	);
})();
