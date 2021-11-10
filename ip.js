var u32 = (...octets) => Buffer.from(octets).readUInt32BE();

class IP {
    /**
     * Private addresses (incl. localhost) [min, max] as described in
     * [IBM's docs](https://www.ibm.com/docs/en/SSSHRK_4.2.0/disco/concept/dsc_private_addr_ranges.html)
     * (0 - **localhost**, 1 - **class A**, 2 - **class B**, 3 - **class C**)
     * 
     * @type {Array<number[]>}
     */
    static PrivateRanges = [
        [2130706433, 2130706433],
        [ 167772160,  184549375],
        [2886729728, 2887778303],
        [3232235520, 3232301055],
    ];
    
    /**
     * Get the uint32 representation of an IP
     * 
     * @param {string} ip 
     * @returns {number}
     * @example NumberFromIP('127.0.0.1') -> 2130706433
     */
    static NumberFromIP(ip) {
        if('string' !== typeof ip) {
            throw new TypeError('ip must be a string');
        }
        
        var octets = ip.split('.');
        if(octets.length !== 4) {
            throw new Error('ip doesn\'t have 4 octets');
        }
        
        // Can't use left shift because it's signed...
        // Typical javascript shenanigans.
        return u32(...octets);
    }
    
    /**
     * Retrieve an IP from a numeric representation
     * 
     * @param {number} long
     * @returns {string}
     * @example IPFromNumber(3232235521) -> '192.168.0.1'
     */
    static IPFromNumber(long) {
        if('number' !== typeof long) {
            throw new TypeError('long must be a number');
        }
        
        var octets = [
            (long >>> 8 * 3) & 0xff,
            (long >>> 8 * 2) & 0xff,
            (long >>> 8 * 1) & 0xff,
            (long >>> 8 * 0) & 0xff,
        ];
        
        return octets.join('.');
    }
}

module.exports = IP;
