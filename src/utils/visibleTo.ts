export namespace VisibleTo {
    export const toString = (visibleTo: ReadonlyArray<string> | ReadonlySet<string>): string => {
        return [...visibleTo].sort().reduce((seed, elem) => seed === '' ? elem : `${seed};${elem}`, '');
    };
}