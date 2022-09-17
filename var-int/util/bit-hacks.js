/**
 * Fast floored binary logarithm with a constant least-significant
 * bit to be used in specific situations that require this behavior.
 * @param {Number} x
 * @returns {Number} floor(log2(x)) for any 1 < (uint)x < 2 ^ 32
 */
const __ffbl_clz32 = (x) => 32 - Math.clz32(x | 1);

module.exports = {
	__ffbl_clz32
}
