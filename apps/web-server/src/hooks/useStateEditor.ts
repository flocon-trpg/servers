import produce from 'immer';
import React from 'react';
import { useLatest } from 'react-use';
import { Option } from '@kizahasi/option';
import { create, update } from '../utils/constants';

// Symbol() でなくとも {} などでもいい
const emptySymbol = Symbol();

export type Recipe<T> = (state: T) => T | void;
type CreateInitState<T> = () => T;
type OnCreate<T> = (newState: T) => void;

export type StateEditorParams<T> =
    | {
          type: typeof create;
          createInitState: CreateInitState<T>;
          onCreate?: OnCreate<T>;
      }
    | {
          type: typeof update;
          state: T;
          updateWithImmer: Recipe<T>;
      };

type ReferencedStateEditorParams<T> =
    | {
          type: typeof create;
          createInitState: React.MutableRefObject<CreateInitState<T> | undefined>;
          onCreate: React.MutableRefObject<OnCreate<T> | undefined>;
      }
    | {
          type: typeof update;
          state: T;
          updateWithImmer: React.MutableRefObject<Recipe<T> | undefined>;
      };

function useReferencedParams<T>(
    params: StateEditorParams<T> | undefined
): ReferencedStateEditorParams<T> | undefined {
    const createInitStateRef = React.useRef<CreateInitState<T>>();
    const onCreateRef = React.useRef<OnCreate<T>>();
    const updateWithImmerRef = React.useRef<Recipe<T>>();

    React.useEffect(() => {
        switch (params?.type) {
            case create: {
                createInitStateRef.current = params.createInitState;
                onCreateRef.current = params.onCreate;
                updateWithImmerRef.current = undefined;
                break;
            }
            case update: {
                createInitStateRef.current = undefined;
                onCreateRef.current = undefined;
                updateWithImmerRef.current = params.updateWithImmer;
                break;
            }
            default: {
                createInitStateRef.current = undefined;
                onCreateRef.current = undefined;
                updateWithImmerRef.current = undefined;
                break;
            }
        }
    }, [params]);

    const state = params?.type === update ? params.state : undefined;
    return React.useMemo(() => {
        switch (params?.type) {
            case create:
                return {
                    type: create,
                    createInitState: createInitStateRef,
                    onCreate: onCreateRef,
                };
            case update: {
                return {
                    type: update,
                    updateWithImmer: updateWithImmerRef,
                    state: state!,
                };
            }
            default:
                return undefined;
        }
    }, [params?.type, state]);
}

// Stateを新規作成(create)もしくは更新(update)するUIで、2つの処理を極力共通化するためのhook。createはボタンなどを押すまで作成されず、updateは値が変わるたびにStateにその変更が反映される場面を想定。
export function useStateEditor<T>(params: StateEditorParams<T> | undefined) {
    // 例えばcreateモード→updateモードと来て再びcreateモードになったときに、以前のcreateモードのStateを復元するために用いられるRef。
    const stateToCreateCacheRef = React.useRef<T | typeof emptySymbol>(emptySymbol);

    const safeParams = useReferencedParams(params);
    const safeParamsRef = useLatest(safeParams);

    const [state, setState] = React.useState<T | typeof emptySymbol>(
        (() => {
            switch (params?.type) {
                case undefined:
                    return emptySymbol;
                case update:
                    return params.state;
                case create:
                    return params.createInitState();
            }
        })()
    );
    const stateRef = useLatest(state);

    const stateProp = params?.type === update ? params.state : emptySymbol;
    // update ならば state を常に更新
    React.useEffect(() => {
        if (stateProp !== emptySymbol) {
            setState(stateProp);
        }
    }, [stateProp]);
    // update 以外に切り替わったときも state を更新
    React.useEffect(() => {
        switch (params?.type) {
            case create: {
                if (safeParamsRef.current?.type !== create) {
                    throw new Error('This should not happen');
                }
                if (stateToCreateCacheRef.current === emptySymbol) {
                    stateToCreateCacheRef.current =
                        safeParamsRef.current.createInitState.current!();
                }
                setState(stateToCreateCacheRef.current);
                break;
            }
            case undefined: {
                setState(emptySymbol);
                break;
            }
        }
    }, [params?.type, safeParamsRef]);

    const updateState = React.useCallback(
        (recipe: Recipe<T>) => {
            if (safeParamsRef.current?.type === create) {
                setState(uiState => produce(uiState, recipe));
                return;
            }
            if (safeParamsRef.current?.type === update) {
                safeParamsRef.current.updateWithImmer.current!(
                    produce(safeParamsRef.current.state, recipe)
                );
            }
        },
        [safeParamsRef]
    );

    const ok = React.useCallback(() => {
        if (safeParamsRef.current == null) {
            return Option.none();
        }
        if (safeParamsRef.current?.type === create) {
            const currentState = stateRef.current;
            if (currentState === emptySymbol) {
                throw new Error('This should not happen.');
            }
            const onCreate = safeParamsRef.current.onCreate.current;
            if (onCreate != null) {
                onCreate(currentState);
            }
            stateToCreateCacheRef.current = emptySymbol;
            return Option.some(currentState);
        }
        return Option.none();
    }, [safeParamsRef, stateRef]);

    return React.useMemo(
        () => ({
            // UI 表示に用いる State。
            state: state === emptySymbol ? undefined : state,

            // UI の操作などがあり、State を変更したい際に実行する。
            updateState,

            // create モードの場合は、これを実行すると新規作成するとみなされる。新規作成処理を行うには、onClose に書くか、この関数の戻り値を利用する。
            // create モード以外の場合は何も起こらない。
            ok,
        }),
        [ok, state, updateState]
    );
}
