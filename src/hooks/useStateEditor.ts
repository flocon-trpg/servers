import React from 'react';

function useStateEditorCore<T>(state: T | undefined, defaultState: T, onUpdate: (params: { prevState: T; nextState: T }) => void) {
    const [result, setResultCore] = React.useState<T>(defaultState);

    const stateRef = React.useRef(state);
    React.useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const defaultStateRef = React.useRef(defaultState);
    React.useEffect(() => {
        defaultStateRef.current = defaultState;
    }, [defaultState]);

    const onUpdateRef = React.useRef(onUpdate);
    React.useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    const setResult = React.useCallback((newState: T) => {
        if (stateRef.current == null) {
            setResultCore(newState);
            return;
        }
        onUpdateRef.current({ prevState: stateRef.current, nextState: newState });
    }, []);

    React.useEffect(() => {
        if (state === undefined) {
            setResultCore(defaultStateRef.current);
            return;
        }
        setResultCore(state);
    }, [state]);

    return { state: result, setState: setResult, stateToCreate: state === undefined ? result : undefined };
}

/**
 * stateのcreateとupdateを自動的に切り替える機能をサポートするhook。createはボタンなどを押すまで作成されず、updateは値が変わるたびにstateにその変更が反映される場面を想定。
 * 
 * @example
 * ```
 * const diffCharacter = …;
 * const operateCharacter = …;
 * const createCharacter = …;
 * 
 * const { result, setResult, stateToCreate } = useEditState(room.characters.get('TARGET_ID'), { name: 'New character', … }, ({ prevState, nextState }) => {
 *     const operation = diffCharacter(prevState, nextState);
 *     operateCharacter(operation); // これにより room.characters.get('TARGET_ID') の値を変える(変更する必要がないとoperateCharacterの内部が判断した場合は変えなくてもよい)。引き続きupdateモードとなるならば、resultの値もそれに合わせて変わる。
 * }));
 * 
 * return (<div>
 *     <CharacterEditor character={result} onCharacterChange={setResult} />
 *     <Button disabled={stateToCreate === undefined} onClick={() => createCharacter(stateToCreate)}>作成</Button>
 * </div>);
 * ```
 * 
 * @typeParam T - nullやundefinedが含まれない型にすることを推奨。
 * 
 * @param state - nullishならばcreateモード、そうでないならばそのstateに対するupdateモードとなる。
 * @param defaultState - createする際、初期状態を表すstate。
 * @param onUpdate - updateの際に行われる処理。通常は、これによりstateの変更を誘発させうる処理を書く。
 * 
 * @returns stateは、UIに表示させる値。updateの場合はstateが、createの場合は内部のuseStateで保存されている値が返される。stateToCreateは、createさせたい際に用いる値。updateモードならばundefinedとなる。
 */
export function useStateEditor<T>(state: T | null | undefined, defaultState: T, onUpdate: (params: { prevState: T; nextState: T }) => void) {
    return useStateEditorCore(state ?? undefined, defaultState, onUpdate);
}