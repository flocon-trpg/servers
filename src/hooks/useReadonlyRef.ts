import React from 'react';

export const useReadonlyRef = <T>(value: T): { readonly current: T } => {
    const result = React.useRef(value);
    React.useEffect(() => { result.current = value; }, [value]);
    return result;
};