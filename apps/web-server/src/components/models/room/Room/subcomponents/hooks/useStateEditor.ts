import { loggerRef } from '@flocon-trpg/utils';
import { Option } from '@kizahasi/option';
import { produce } from 'immer';
import React from 'react';
import { useLatest } from 'react-use';
import { Recipe } from '@/utils/types';

// Symbol() でなくとも {} などでもいい
const emptySymbol = Symbol();

type CreateInitState<T> = () => T;
type OnCreate<T> = (newState: T) => void;

export type CreateModeParams<T> = {
    createInitState: CreateInitState<T>;
    updateInitState?: Recipe<T>;
    onCreate?: OnCreate<T>;
};

export type UpdateModeParams<T> = {
    state: T;
    onUpdate: (newValue: T) => void;
};

// Stateを新規作成(create)もしくは更新(update)するUIで、2つの処理を極力共通化するためのhook。createはボタンなどを押すまで作成されず、updateは値が変わるたびにStateにその変更が反映される場面を想定。
//
// createModeとupdateModeが両方ともnon-nullishであってはならない。もしその場合は、暫定的にcreateModeのほうを無視することにしている。両方ともnullishなのは問題ない。
// createModeを渡す際は、useMemoなど（厳密に言うと、useMemoには常に同じ値を返すという保証はないため不十分）を使って更新を最小限に抑える必要がある。そうでないと、createMode != null のとき、createInitState()が実行されたときからstateが変わらなくなってしまう。
//
// 引数をcreateModeとupdateModeにわけている理由は、前者は頻繁に更新してほしくなく、後者は逆に常に更新してほしい値であり、もしこれらが統合されているとuseMemoを呼ぶ際にdepsの指定方法が困難になるため。
export function useStateEditor<T>({
    createMode,
    updateMode,
}: {
    createMode: CreateModeParams<T> | undefined;
    updateMode: UpdateModeParams<T> | undefined;
}) {
    React.useEffect(() => {
        if (updateMode != null && createMode != null) {
            loggerRef.warn('useStateEditorにおいて、updateとcreateの両方がnon-nullishです。');
        }
    }, [updateMode, createMode]);

    // 例えばcreateモード→updateモードと来て再びcreateモードになったときに、以前のcreateモードのStateを復元するために用いられるRef。
    const stateToCreateCacheRef = React.useRef<T | typeof emptySymbol>(emptySymbol);

    const createModeRef = useLatest(createMode);
    const updateModeRef = useLatest(updateMode);

    const [state, setState] = React.useState<T | typeof emptySymbol>(
        (() => {
            if (updateMode != null) {
                return updateMode.state;
            }
            if (createMode != null) {
                return createMode.createInitState();
            }
            return emptySymbol;
        })()
    );
    const stateRef = useLatest(state);

    /*
このuseEffectのdepsを例えば[createMode]から[createMode != null]に変更することで「createを渡す際はuseMemoなどを使う必要がある」という制約を外すことができそうだが、それはうまくいかない。
例えば次のようなantdのModalを使ったコードを考える。


const SampleUI = ({stateEditorParams}) => {
    const stateEditorResult = useStateEditor(stateEditorParams);

    // 何らかのStateを編集するUI。stateEditorResultを使用している。
    return <div>……</div>;
}

export const SampleModal = () => {
    const [someModalState, setSomeModalState] = useAtom(someModalStateAtom);

    let visible;
    let stateEditorParams;
    switch (someModalState.type) {
        case 'closed':
            visible = false;
            stateEditorParams = undefined;
            break;
        case 'update':
            visible = true;
            stateEditorParams = ……;
            break;
        case 'create':
            visible = true;
            stateEditorParams = ……;
            break;
    }

    return <Modal open={visible}><SampleUI stateEditorParams={stateEditorParams}></Modal>
}


「新たなStateを作成するため、Modalをcreateモードで開く」→「新規作成されたStateをどこかに反映させて、Modalを閉じる」→「さらに新たなStateを作成するため、Modalを再度createモードで開く」
という流れが実行されるケースを考える。この際、stateEditorParams.createMode == null の値の流れは一見すると
false → true → false
になりそうだが、実際は
false → false
になる。理由は、Modalが非表示のときはSampleUIはレンダリングされないため。これにより、最初に作成したStateが破棄されず残ってしまう。

よって、depsを[createMode == null]にすることは困難である。
    */
    React.useEffect(() => {
        if (createMode == null) {
            return;
        }
        if (stateToCreateCacheRef.current === emptySymbol) {
            stateToCreateCacheRef.current = createMode.createInitState();
        } else {
            if (createMode.updateInitState != null) {
                const newState = produce(stateToCreateCacheRef.current, createMode.updateInitState);
                stateToCreateCacheRef.current = newState;
            }
        }
        setState(stateToCreateCacheRef.current);
    }, [createMode]);
    React.useEffect(() => {
        if (updateMode == null) {
            return;
        }
        setState(updateMode.state);
    }, [updateMode]);

    const updateState = React.useCallback(
        (recipe: Recipe<T>) => {
            if (createModeRef.current != null) {
                const newState = produce(stateRef.current, recipe);
                setState(newState);
                stateToCreateCacheRef.current = newState;
            }
            if (updateModeRef.current != null) {
                updateModeRef.current.onUpdate(produce(updateModeRef.current.state, recipe));
            }
        },
        [createModeRef, stateRef, updateModeRef]
    );

    const ok = React.useCallback(() => {
        if (createModeRef.current != null) {
            const currentState = stateRef.current;
            if (currentState === emptySymbol) {
                throw new Error('This should not happen.');
            }
            const onCreate = createModeRef.current.onCreate;
            if (onCreate != null) {
                onCreate(currentState);
            }

            // createInitState内で例えばPiecePositionを用いているかもしれないため、ここで次のStateを作成せず、必要になったときに作成するようにしている。
            // setStateは実行していない。理由は、まず、okを実行する場合は「すぐModalなどを閉じる（createModeをundefinedにする）」と「ModalなどのUIをdisabledにして、反映に成功したらModalを閉じる、失敗したらdisabledを解除する」の2つのケースのみが現時点では想定される。前者のケースではsetStateにセットする値は何でもよく、後者では何もセットしないほうがいい。よってsetStateは実行していない。
            stateToCreateCacheRef.current = emptySymbol;

            return Option.some(currentState);
        }
        return Option.none();
    }, [createModeRef, stateRef]);

    return React.useMemo(
        () => ({
            // UI 表示に用いる State。
            state: state === emptySymbol ? undefined : state,

            // UI の操作などがあり、State を変更したい際に実行する。
            updateState,

            // create モードの場合は、これを実行すると新規作成するとみなされる。新規作成処理を行うには、onClose に書くか、この関数の戻り値を利用する。新規作成処理内に、paramsをundefinedに変更する処理を行うことを強く推奨する（そうしないとcreateモードが終わったと認識されないが、その一方でsetState(emptySymbol)も実行されるため、不具合が生じる可能性が高い）。
            // create モード以外の場合は何も起こらない。
            ok,
        }),
        [ok, state, updateState]
    );
}
