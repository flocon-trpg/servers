import React from 'react';

// CONSIDER: react-useのuseLatestと役割が被ってしまっている

export const useReadonlyRef = <T>(value: T): { readonly current: T } => {
    const result = React.useRef(value);
    React.useEffect(() => {
        result.current = value;
    }, [value]);
    return result;
};
