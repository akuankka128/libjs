/**
 * Encodes a number into a VarInt (note: little-endian)
 * @param {Number} int 
 * @returns {Buffer}
 */
function encode(int) {
    /** 7 bits */
    const MAX_CHUNK = 0b1111111;

    var size = Math.ceil(Math.log2(int) / 7);
    if(size === -Infinity || size === 0) {
        // because fuck math amirite
        size = 1;
    }

    var output = Buffer.allocUnsafe(size);

    /** input & 7 bits */
    var chunk = int & MAX_CHUNK;
    var index = 0;

    while(chunk != 0) {
        if((int >>= 7) & MAX_CHUNK) {
            // set 8th bit to 1 to signal
            // that the parser should
            // keep reading
            output [index] |= 0b10000000;
        } else {
            // is this more efficient
            // than reassignment?
            output [index] &= 0;
        }

        // add 7-bit group to chunk
        output [index] |= chunk;

        index += 1;
        chunk = int & MAX_CHUNK;
    }

    return output;
}

/**
 * Decodes a VarInt into a number
 * @param {Buffer} varint 
 * @returns {Number}
 */
function decode(varint) {
    var index = 0;
    var value = 0;

    while(true) {
        var chunk = varint [index];

        // extract the 7-bit group
        chunk = chunk & 0b1111111;

        // add the little-endian number to value
        value += chunk << 7 * index;

        // check if the continuation bit is unset
        if((varint [index++] & 0b10000000) === 0) {
            break;
        }
    }

    return value;
}

module.exports = { encode, decode };
