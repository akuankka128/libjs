const { encodeVarInt, decodeVarInt } = require('./index.js');
const tests = [];

const addTest = (fn, expected) => {
	if (typeof fn !== 'function') {
		throw new TypeError;
	}

	tests.push([fn, expected]);
}

const runTests = () => {
	tests.forEach((test, index) => {
		const [fn, expected] = test;
		const result = fn();

		// Half-assed test runner
		const eqs = result instanceof Buffer
			? result.equals(expected)
			: result === expected;

		if (!eqs) {
			console.log('FAIL test #%s (expected %o, given %o)', index + 1, expected, result);
		} else {
			console.log(`PASS test #%s`, index + 1);
		}
	});
}

// Test the test
addTest(() => 1, 1);

addTest(() => encodeVarInt(0), Buffer.from([0]));
addTest(() => encodeVarInt(1), Buffer.from([1]));
addTest(() => encodeVarInt(127), Buffer.from([0x7F]));
addTest(() => encodeVarInt(128), Buffer.from([0x80, 0x01]));
addTest(() => encodeVarInt(2 ** 14 - 1), Buffer.from([0xFF, 0x7F]));
addTest(() => encodeVarInt(2 ** 14), Buffer.from([0x80, 0x80, 0x01]));
addTest(() => encodeVarInt(2 ** 21 - 1), Buffer.from([0xFF, 0xFF, 0x7F]));
addTest(() => encodeVarInt(2 ** 21), Buffer.from([0x80, 0x80, 0x80, 0x01]));
addTest(() => encodeVarInt(2 ** 28 - 1), Buffer.from([0xFF, 0xFF, 0xFF, 0x7F]));
addTest(() => encodeVarInt(2 ** 28), Buffer.from([0x80, 0x80, 0x80, 0x80, 0x01]));
addTest(() => encodeVarInt(2 ** 32 - 1), Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0x0F]));
// addTest(() => encodeVarInt(2 ** 32), Buffer.from([0x80, 0x80, 0x80, 0x80, 0x01]));

addTest(() => decodeVarInt(encodeVarInt(0)), 0);
addTest(() => decodeVarInt(encodeVarInt(1)), 1);
addTest(() => decodeVarInt(encodeVarInt(127)), 127);
addTest(() => decodeVarInt(encodeVarInt(128)), 128);
addTest(() => decodeVarInt(encodeVarInt(2 ** 14 - 1)), 2 ** 14 - 1);
addTest(() => decodeVarInt(encodeVarInt(2 ** 14)), 2 ** 14);
addTest(() => decodeVarInt(encodeVarInt(2 ** 21 - 1)), 2 ** 21 - 1);
addTest(() => decodeVarInt(encodeVarInt(2 ** 21)), 2 ** 21);
addTest(() => decodeVarInt(encodeVarInt(2 ** 28 - 1)), 2 ** 28 - 1);
addTest(() => decodeVarInt(encodeVarInt(2 ** 28)), 2 ** 28);
addTest(() => decodeVarInt(encodeVarInt(2 ** 32 - 1)), 2 ** 32 - 1);
// addTest(() => decodeVarInt(encodeVarInt(2 ** 32)), 2 ** 32);
runTests();
