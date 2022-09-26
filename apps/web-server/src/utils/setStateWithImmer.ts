import produce from 'immer';

/**
 * @example
 * ```
 * const [, setArrayState] = React.useState<string[]>([]);
 * const setArrayStateWithImmer = setStateWithImmer(setArrayState)
 *
 * return (
 *     <SomeComponent
 *         onSomething={newValue => setArrayStateWithImmer(oldState => oldState.push(newValue))}
 *     />
 * );
 * ```
 */
export const setStateWithImmer =
    <T>(action: React.Dispatch<React.SetStateAction<T>>) =>
    (recipe: (x: T) => T | void | undefined) => {
        action(oldState => produce(oldState, recipe));
    };
