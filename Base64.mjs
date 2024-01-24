export default class Base64 {
  // We convert input text into bytes,
  // so use character codes instead
  static #PADDING_CHAR = '='.charCodeAt(0);
  static #BASE64_CHARS = Uint8Array.from([
    ... 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ... 'abcdefghijklmnopqrstuvwxyz',
    ... '0123456789+/',
  ]
  .map((char) => char.charCodeAt(0)));

  // Utilities for converting text to/from raw bytes
  static #TEXT_ENCODER = new TextEncoder();
  static #TEXT_DECODER = new TextDecoder();

  static {
    // Tamper-proofing and a potential optimization
    Object.freeze(this);
  }

  /**
   * @param {string} text Text to be encoded into base-64
   * @returns {string}
   */
  static EncodeText (text) {
    const bytes = this.#TEXT_ENCODER.encode(text);
    return this.EncodeBytes(bytes);
  }

  /**
   * @param {Uint8Array} srcArray Data to be encoded
   * @returns {string}
   */
  static EncodeBytes (srcArray) {
    const resultCount = Math.ceil(srcArray.byteLength * 1.25);
    const paddedCount = Math.ceil(resultCount / 4) * 4;
    const destArray = new Uint8Array(paddedCount);
    const byteLength = srcArray.byteLength;

    for (
      let blockIndex = 0;
      blockIndex * 3 < byteLength;
      blockIndex ++
    ) {
      const srcStart = blockIndex * 3;
      const destStart = blockIndex * 4;
      this.#EncodeBlock(
        srcArray,
        destArray,
        srcStart,
        destStart
      );
    }

    const paddingCount = (3 - (srcArray.byteLength % 3)) % 3;
    if (paddingCount > 0) destArray[destArray.byteLength - 1] = Base64.#PADDING_CHAR;
    if (paddingCount > 1) destArray[destArray.byteLength - 2] = Base64.#PADDING_CHAR;
    return Base64.#TEXT_DECODER.decode(destArray);
  }

  /**
   * @param {Uint8Array} srcArray
   * @param {Uint8Array} destArray
   * @param {number} srcStart
   * @param {number} destStart
   */
  static #EncodeBlock (srcArray, destArray, srcStart, destStart) {
    const aggregate = (
      srcArray[srcStart + 0] << 16
      | srcArray[srcStart + 1] << 8
      | srcArray[srcStart + 2] << 0
    );

    const chars = Base64.#BASE64_CHARS;
    destArray[destStart + 0] = chars[(aggregate >>> 18) & 63];
    destArray[destStart + 1] = chars[(aggregate >>> 12) & 63];
    destArray[destStart + 2] = chars[(aggregate >>> 6) & 63];
    destArray[destStart + 3] = chars[(aggregate >>> 0) & 63];
  }

  /**
   * @param {string} data Base-64-encoded data
   * @returns {Uint8Array}
   */
  static DecodeToBinary (data) {
    if (data.length % 4 !== 0) {
      throw new SyntaxError('base64 data must have 4-character alignment');
    }

    const blockCount = Math.ceil(data.length / 4);
    const outputSize = Math.ceil(data.length / 4) * 3;
    const destArray = new Uint8Array(outputSize);
    const srcArray = this.#TEXT_ENCODER.encode(data);

    for (
      let blockIndex = 0;
      blockIndex < blockCount;
      blockIndex ++
    ) {
      const srcStart = blockIndex * 4;
      const destStart = blockIndex * 3;
      this.#DecodeBlock(
        srcArray,
        destArray,
        srcStart,
        destStart
      );
    }

    const lastBlock = srcArray.subarray(-4);
    const unpadCount = (
      + this.#IsPadding(lastBlock.at(-1))
      + this.#IsPadding(lastBlock.at(-2))
    ) || -srcArray.byteLength;

    return destArray.subarray(0, -unpadCount);
  }

  /**
   * @param {string} data Base-64-encoded data
   * @returns {string}
   */
  static DecodeToText (data) {
    const binary = this.DecodeToBinary(data);
    return this.#TEXT_DECODER.decode(binary);
  }

  /**
   * @param {string} srcArray
   * @param {Uint8Array} destArray
   * @param {number} srcStart
   * @param {number} destStart
   */
  static #DecodeBlock (srcArray, destArray, srcStart, destStart) {
    // Undefined behavior: this code invariantly assumes that every character
    // in the given string is a valid base-64 character, but if it isn't,
    // `indexOf()` will return -1, which can mess with the expected result
    const byte0 = this.#BASE64_CHARS.indexOf(srcArray[srcStart + 0]);
    const byte1 = this.#BASE64_CHARS.indexOf(srcArray[srcStart + 1]);
    const byte2 = this.#BASE64_CHARS.indexOf(srcArray[srcStart + 2]);
    const byte3 = this.#BASE64_CHARS.indexOf(srcArray[srcStart + 3]);
    destArray[destStart + 0] |= (byte0 & 0b00111111) << 2;
    destArray[destStart + 0] |= (byte1 & 0b00110000) >>> 4;
    destArray[destStart + 1] |= (byte1 & 0b00001111) << 4;
    destArray[destStart + 1] |= (byte2 & 0b00111100) >>> 2;
    destArray[destStart + 2] |= (byte2 & 0b00000011) << 6;
    destArray[destStart + 2] |= (byte3 & 0b00111111) >>> 0;
  }

  /**
   * @param {number} char Character as a byte
   * @returns {boolean} Whether the input is padding ('=') or not
   */
  static #IsPadding (char) {
    return char === this.#PADDING_CHAR;
  }
}
