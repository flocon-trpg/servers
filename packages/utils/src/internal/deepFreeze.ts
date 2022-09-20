/** Freezes an object recursively. */
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze を参考にした
export const deepFreeze = (object: any): void => {
    if (!object || typeof object !== 'object') {
        return;
    }

    const propNames = Object.getOwnPropertyNames(object);

    for (const name of propNames) {
        const value = object[name];
        deepFreeze(value);
    }

    Object.freeze(object);
};
