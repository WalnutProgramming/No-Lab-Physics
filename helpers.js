function randomHelper(min, max) {
	return min + Math.random() * (max - min);
}

export function random(a, b) {
	if (a == null && b == null) return randomHelper(0, 1);
	else if (b == null) return randomHelper(0, a);
	else return randomHelper(a, b);
}

export function constrain(n, low, high) {
	return Math.max(Math.min(n, high), low);
}
