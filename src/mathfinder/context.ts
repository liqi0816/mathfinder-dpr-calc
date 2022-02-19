export type NestedHaystack<TTerminal, TKey extends string = string> = {
    [key in TKey]: TTerminal | NestedHaystack<TTerminal>;
};

const isPrimitive = <TTerminal>(value: any): value is TTerminal => typeof value !== 'object';
export function* deepEntries<TTerminal, TKey extends string>(
    root: NestedHaystack<TTerminal, TKey>,
    isTerminal: (value: any) => value is TTerminal = isPrimitive
): Generator<[TKey, TTerminal, NestedHaystack<TTerminal, TKey>]> {
    for (const [key, value] of Object.entries(root) as [TKey, TTerminal | NestedHaystack<TTerminal, TKey>][]) {
        if (isTerminal(value)) {
            yield [key, value, root];
        } else {
            yield* deepEntries(value, isTerminal);
        }
    }
}

export function* deepPrefixEntries<TTerminal, TKey extends string>(
    root: NestedHaystack<TTerminal, TKey>,
    isTerminal: (value: any) => value is TTerminal = isPrimitive,
    prefix: TKey[] = []
): Generator<[ReadonlyArray<TKey>, TTerminal, NestedHaystack<TTerminal, TKey>]> {
    for (const [key, value] of Object.entries(root) as [TKey, TTerminal | NestedHaystack<TTerminal, TKey>][]) {
        prefix.push(key);
        if (isTerminal(value)) {
            yield [prefix, value, root];
        } else {
            yield* deepPrefixEntries(value, isTerminal, prefix);
        }
        prefix.pop();
    }
}

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

export function fuzzyGet<TTerminal, TKey extends string>(
    root: NestedHaystack<TTerminal, TKey>,
    key: TKey[],
    isTerminal: (value: any) => value is TTerminal = isPrimitive
): TTerminal | undefined {
    /**
     * example:
     * bab17.hit.bab 111
     * bab17.bab 101
     * hit.bab 011
     * bab 001
     */
    for (const mask of genMask(key.length)) {
        let current = root;
        for (const [i, k] of key.entries()) {
            if (current === undefined || current === null) break;
            if (!mask[i]) continue;
            current = current[k] as NestedHaystack<TTerminal, TKey>;
        }
        if (current === undefined || current === null) continue;
        if (isTerminal(current)) return current;
    }
}
