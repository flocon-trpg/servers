import React from 'react';
import { useReadonlyRef } from './useReadonlyRef';
import { usePrevious } from './usePrevious';

export const update = 'update';
export const create = 'create';

export type StateEditorParams<T> =
    | {
          type: typeof update;
          state: T;
          onUpdate: (params: { prevState: T; nextState: T }) => void;
      }
    | {
          type: typeof create;
          initState: T;
      };

// stateのcreateとupdateを自動的に切り替える機能をサポートするhook。createはボタンなどを押すまで作成されず、updateは値が変わるたびにstateにその変更が反映される場面を想定。
// 注意点として、stateがcreateからcreateに変わった場合は、そのときにもしinitStateが変わっても変更が反映されないという仕様。これにより、作成をキャンセルしてまた作成しようとしたときに前のデータが残るようになるというメリットがある。
export function useStateEditor<T>(state: StateEditorParams<T>) {
    const [uiState, setUiState] = React.useState<T>(
        (() => {
            switch (state.type) {
                case update:
                    return state.state;
                case create:
                    return state.initState;
            }
        })()
    );

    const stateRef = useReadonlyRef(state);

    const resetUiState = React.useCallback(() => {
        if (stateRef.current.type !== create) {
            return false;
        }
        setUiState(stateRef.current.initState);
        return true;
    }, [stateRef]);

    const updateUiState = React.useCallback(
        (newState: T) => {
            if (stateRef.current.type === create) {
                setUiState(newState);
                return;
            }
            stateRef.current.onUpdate({ prevState: stateRef.current.state, nextState: newState });
        },
        [stateRef]
    );

    const previousState = usePrevious(state);

    React.useEffect(() => {
        if (state.type === create) {
            if (previousState?.type === create) {
                return;
            }
            setUiState(state.initState);
            return;
        }
        setUiState(state.state);
    }, [state, previousState]);

    return {
        // UIに表示するstate。これを何らかのコンポーネントに渡して表示する。
        uiState,

        // stateを更新する。
        // updateモードのときは、onUpdateが実行される（通常はこれによりstate.stateの値が変わるため、それによりuiStateも変わるという流れ）。
        // createモードのときは、このhook内部で変更が処理されてuiStateが変更される。
        updateUiState,

        // createモードのとき、uiStateを初期化する。
        // updateモードのときは何も起こらない。
        resetUiState,
    };
}
