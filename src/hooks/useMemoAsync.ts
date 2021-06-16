import React from 'react';
import { useReadonlyRef } from './useReadonlyRef';

export const useMemoAsync = <T>(factory: () => Promise<T>, deps: React.DependencyList | undefined): T | undefined => {
    const [result, setResult] = React.useState<T>();
    const factoryRef = useReadonlyRef(factory);
    React.useEffect(() => {
        setResult(undefined);
        factoryRef.current().then(setResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return result;
};