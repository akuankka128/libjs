class bitfield {
    constructor(bits) {
        this.bits = new Uint8Array(
            Math.ceil(bits / 8)
        );
    }

    toggled(bit) {
        var x = bit >>> 3;
        var y = bit % 8;
        return this.bits[x] & (1 << y);
    }

    toggle(bitn) {
        var x = bitn >>> 3;
        var y = bitn % 8;
        this.bits[x] ^= (1 << y);
        return this;
    }

    clear(field) {
        this.bits[field] &= 0;
        return this;
    }

    fill(field) {
        this.bits[field] |= 0xff;
        return this;
    }

    enable(bit) {
        var x = bit >>> 3;
        var y = bit % 8;
        this.bits[x] |= (1 << y);
        return this;
    }

    disable(bit) {
        var x = bit >>> 3;
        var y = bit % 8;

        var field = this.bits[x];
        this.bits[x] &= field ^ (1 << y);

        return this;
    }
}

module.exports = bitfield;
