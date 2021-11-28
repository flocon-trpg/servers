import produce from 'immer';
import React from 'react';
import { usePrevious } from 'react-use';
import { useReadonlyRef } from './useReadonlyRef';

export const update = 'update';
export const create = 'create';

type Recipe<T> = (state: T) => T | void;

export type StateEditorParams<T> =
    | {
          type: typeof update;
          state: T;
          onUpdate: (newState: T) => void;
      }
    | {
          type: typeof create;
          initState: T;

          // stateがcreateからcreateに変わった場合は、上のinitStateに置き換わるのではなく、既存のstateをupdateInitStateによって変換された値が使われる(undefinedの場合は変換されない)。これにより、作成をキャンセルしてまた作成しようとしたときに前のデータが残るようになるというメリットがある。
          // updateInitState != null のときは、StateEditorParamsはuseMemoを用いたものにしないと無限ループになる可能性があるので注意。
          updateInitState?: (prev: T) => T;
      };

// stateのcreateとupdateを自動的に切り替える機能をサポートするhook。createはボタンなどを押すまで作成されず、updateは値が変わるたびにstateにその変更が反映される場面を想定。
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

    const resetUiState = React.useCallback(
        (newState?: T) => {
            if (stateRef.current.type !== create) {
                return false;
            }
            setUiState(newState == null ? stateRef.current.initState : newState);
            return true;
        },
        [stateRef]
    );

    const updateUiState = React.useCallback(
        (recipe: Recipe<T>) => {
            if (stateRef.current.type === create) {
                setUiState(uiState => produce(uiState, recipe));
                return;
            }
            stateRef.current.onUpdate(produce(stateRef.current.state, recipe));
        },
        [stateRef]
    );

    const previousState = usePrevious(state);

    React.useEffect(() => {
        if (state.type === create) {
            if (previousState?.type === create) {
                if (state.updateInitState != null) {
                    const f = state.updateInitState;
                    setUiState(prev => f(prev));
                }
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
        // updateモードのときは、onUpdateが実行される（通常は、onUpdateによってStateEditorParams.stateが変更され、それによりuiStateも変わるという流れ）。
        // createモードのときは、このhook内部で変更が処理されてuiStateが変更される。
        updateUiState,

        // createモードのとき、uiStateを初期化する。
        // updateモードのときは何も起こらない。
        resetUiState,
    };
}
