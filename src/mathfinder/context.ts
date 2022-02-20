export type ReplaceNestedType<Root, Prop> = {
    [K in keyof Root]: Root[K] extends Record<string | number, unknown> ? ReplaceNestedType<Root[K], Prop> : Prop;
};

export type OptionalNestedType<Root> = {
    [K in keyof Root]?: Root[K] extends Record<string | number, unknown> ? OptionalNestedType<Root[K]> : Root[K];
};

export type NestedHaystack<Terminal, Key extends string = string> = {
    [key in Key]: Terminal | NestedHaystack<Terminal>;
};

const isPrimitive = <Terminal>(value: any): value is Terminal => value === null || typeof value !== 'object';
export function* deepEntries<Terminal, Key extends string>(
    root: NestedHaystack<Terminal, Key>,
    isTerminal: (value: any) => value is Terminal = isPrimitive
): Generator<[Key, Terminal, NestedHaystack<Terminal, Key>]> {
    for (const [key, value] of Object.entries(root) as [Key, Terminal | NestedHaystack<Terminal, Key>][]) {
        if (isTerminal(value)) {
            yield [key, value, root];
        } else {
            yield* deepEntries(value, isTerminal);
        }
    }
}

export function* deepPrefixEntries<Terminal, Key extends string>(
    root: NestedHaystack<Terminal, Key>,
    isTerminal: (value: any) => value is Terminal = isPrimitive,
    prefix: Key[] = []
): Generator<[readonly Key[], Terminal, NestedHaystack<Terminal, Key>]> {
    for (const [key, value] of Object.entries(root) as [Key, Terminal | NestedHaystack<Terminal, Key>][]) {
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

export function fuzzyGet<Terminal, Key extends string>(
    root: NestedHaystack<Terminal, Key>,
    key: Key[]
): Terminal | NestedHaystack<Terminal, Key> | undefined;
export function fuzzyGet<Terminal, Key extends string>(
    root: NestedHaystack<Terminal, Key>,
    key: Key[],
    isTerminal: (value: any) => value is Terminal
): Terminal | undefined;
export function fuzzyGet<Terminal, Key extends string>(
    root: NestedHaystack<Terminal, Key>,
    key: Key[],
    isTerminal?: (value: any) => value is Terminal
) {
    /**
     * example search sequence:
     * bab17.hit.bab 111
     * bab17.bab 101
     * hit.bab 011
     * bab 001 <- match
     */
    for (const mask of genMask(key.length)) {
        let current: Terminal | NestedHaystack<Terminal, Key> = root;
        for (const [i, k] of key.entries()) {
            if (current === undefined || current === null) break;
            if (!mask[i]) continue;
            current = (current as NestedHaystack<Terminal, Key>)[k];
        }
        // if this path is not found, next
        if (current === undefined || current === null) continue;
        // if this path has the correct type, return
        if (!isTerminal || isTerminal(current)) {
            return current;
        }
        // if this path is another nested haystack, recurse one more time
        if (typeof current === 'object') {
            // this branch handles pattern like bab12.hit.bab17 -> bab17.hit
            // not passing isTerminal because we don't want to recurse indefinitely
            // this fuzzyGet will return from the `if (!isTerminal)` branch
            const remainderMatch = fuzzyGet(current, key.slice(0, -1));
            if (remainderMatch !== undefined && remainderMatch !== null && isTerminal(remainderMatch)) {
                return remainderMatch;
            }
        }
    }
}
