export const visibleToToString = (
    visibleTo: ReadonlyArray<string> | ReadonlySet<string>
): string => {
    return [...visibleTo]
        .sort()
        .reduce((seed, elem) => (seed === '' ? elem : `${seed};${elem}`), '');
};
