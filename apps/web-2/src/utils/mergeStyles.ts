import React from 'react';

/** @example
 * ```
 * const style1 = { width: 100 };
 * const style2 = { width: undefined, height: 100 };
 * console.log({ ...style1, ...style2 }); // => { width: undefined, height: 100 }
 * console.log(mergeStyles(style1, style2)); // => { width: 100, height: 100 }
 * ```
 */
export const mergeStyles = (
    source: React.CSSProperties | undefined,
    ...objects: (React.CSSProperties | undefined)[]
): React.CSSProperties | undefined => {
    let result = source == null ? undefined : { ...source };
    for (const object of objects) {
        if (object == null) {
            continue;
        }
        if (result == null) {
            result = {};
        }
        for (const key in object) {
            const value = (object as any)[key];
            if (value !== undefined) {
                (result as any)[key] = value as any;
            }
        }
    }
    return result;
};
