const { __ffbl_clz32 } = require('./util/bit-hacks');

// Lookups for the possible
// outputs of __ffbl_clz32
const lookupTable = [
	1, 1, 1, 1, 1, 1, 1,
	1, 2, 2, 2, 2, 2, 2,
	2, 3, 3, 3, 3, 3, 3,
	3, 4, 4, 4, 4, 4, 4,
	4, 5, 5, 5, 5, 5, 5,
];

/**
 * Encodes a variable-length integer
 * @param {Number} number 32-bit input
 * @returns {Buffer}
 */
const encodeVarInt = number => {
	if (Math.abs(number) - (number >>> 0) > 0) {
		throw new RangeError('must satisfy 0 < number < 2 ^ 32');
	}

	const MASK_MSB = 0b10000000;
	const MASK_NUM = 0b01111111;

	const length = lookupTable[__ffbl_clz32(number)];
	let buffer = Buffer.allocUnsafe(length);
	let index = 0;

	while (true) {
		buffer[index] = number & MASK_NUM;
		number >>>= 7;

		if (number > 0) {
			buffer[index] |= MASK_MSB;
		} else {
			break;
		}

		index++;
	}

	return buffer;
}

/**
 * Decodes a variable-length integer
 * @param {Buffer} buffer Encoded VarInt
 */
const decodeVarInt = buffer => {
	const MASK_MSB = 0b10000000;
	const MASK_NUM = 0b01111111;

	let number = 0;
	let index = 0;

	while (true) {
		let byte = buffer.readUint8(index);
		number |= (byte & MASK_NUM) << (7 * index);

		if ((byte & MASK_MSB) === 0) {
			break;
		} else {
			index++;
		}
	}

	return number >>> 0;
}

module.exports = {
	encodeVarInt,
	decodeVarInt,
}
