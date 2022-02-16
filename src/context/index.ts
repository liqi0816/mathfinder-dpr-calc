/**
 * generate array in the form of
 * ```
 * 1,1,1,1
 * 1,1,0,1
 * 1,0,1,1
 * 1,0,0,1
 * 0,1,1,1
 * 0,1,0,1
 * 0,0,1,1
 * 0,0,0,1
 * ```
 */
function* genMask(length: number): Generator<Readonly<Uint8Array>> {
    const ret = new Uint8Array(length);
    ret[length - 1] = 1;
    for (let counter = 2 ** (length - 1) - 1; counter >= 0; counter--) {
        for (let i = 0; i < length - 1; i++) {
            ret[length - 2 - i] = (counter >> i) & 1;
        }
        yield ret;
    }
}

export function fuzzyGet(root: any, key: string[], type: 'string'): string | undefined;
export function fuzzyGet(root: any, key: string[], type: 'number'): number | undefined;
export function fuzzyGet(root: any, key: string[], type?: string): unknown {
    /**
     * example:
     * bab17.hit.bab 111
     * bab17.bab 101
     * hit.bab 011
     * bab 001
     */
    nextMask: for (const mask of genMask(key.length)) {
        let current = root;
        nextK: for (const [i, k] of key.entries()) {
            if (current === undefined || current === null) break;
            if (!mask[i]) continue nextK;
            current = current[k];
        }
        if (current === undefined || current === null) continue nextMask;
        if (type && typeof current !== type) continue nextMask;
        return current;
    }
    return undefined;
}
