import React from 'react';

export function useMap<T1, T2>(source: T1, mapping: (source: T1) => T2) {
    const [result, setResult] = React.useState<T2>(mapping(source));
    const mappingRef = React.useRef(mapping);
    React.useEffect(() => {
        mappingRef.current = mapping;
    }, [mapping]);
    React.useEffect(() => {
        setResult(mappingRef.current(source));
    }, [source]);
    return result;
}