const delegateSymbol = Symbol('React.Dispatch.delegate');
function delegate<S, K extends keyof S>(setState: React.Dispatch<React.SetStateAction<S>>, key: K) {
    type Cached = typeof setState & {
        [delegateSymbol]: { [KSingle in K]?: React.Dispatch<React.SetStateAction<S[KSingle]>> };
    };
    const cache = ((setState as Cached)[delegateSymbol] ??= {});
    return (cache[key] ??= (value: React.SetStateAction<S[K]>) =>
        setState(state => ({
            ...state,
            [key]: typeof value === 'function' ? (value as (prevState: S[K]) => S[K])(state[key]) : value,
        })));
}

export {};
