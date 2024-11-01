import { loggerRef } from '@flocon-trpg/utils';
import { Option } from '@kizahasi/option';
import { atom } from 'jotai';
import { atomWithLazy, loadable } from 'jotai/utils';
import { Subject, concatAll, debounceTime, map } from 'rxjs';

/**
 * localForage を用いて自動保存する atom 。AsyncStorage を用いた atomWithStorage との違いは次のとおり。
 * - ストレージへの保存処理が debounce される。
 * - atom の get は async だが、set は async ではない。ただし、get がどこかで完了していない場合は set を実行しても無視される。
 * - atomSet の引数を利用することで、atom の set のカスタマイズが比較的容易に行える。
 */
export const atomWithDebounceStorage = <T, Args extends unknown[]>({
    getItemFromStorage,
    setItemToStorage,
    atomSet,
}: {
    getItemFromStorage: () => Promise<T>;
    setItemToStorage: (newValue: T) => Promise<void>;
    atomSet: (prev: T, ...args: Args) => T;
}) => {
    // `savesaveRequestSubject.next(async () => { /* ストレージに保存する処理 */});` と書くことでストレージに保存される。next メソッドが短時間で大量に実行された場合は適度に間引かれる。
    const saveRequestSubject = new Subject<() => Promise<void>>();
    // 現状では、この subscribe を unsubscribe 手段がない。そのため、ブラウザのタブを閉じずに複数の部屋を開いて回るとパフォーマンス上の問題が生じる可能性がある。ただし、よほど数が多くならない限りは問題にならないと考えられるため、現状はこのままにしている。
    saveRequestSubject
        .pipe(
            debounceTime(1000),
            map(f => f()),
            concatAll(),
        )
        .subscribe();

    // baseAtom の値は non-null から null に変えてはならない。もしそうしてしまうと、ensureAtom 内の getRoomConfig(roomId) を実行したときに少し古い値が読み込まれてしまうことがある。
    const baseAtom = atom<Option<T>>(Option.none());
    const ensureAtom = atom(get => {
        const base = get(baseAtom);
        if (base.isNone) {
            return getItemFromStorage();
        }
        return base.value;
    });
    return atom<T | Promise<T>, Args, void>(
        get => get(ensureAtom),
        (get, set, ...args: Args) => {
            const awaitedEnsureAtom = loadable(ensureAtom);
            const prevState = get(awaitedEnsureAtom);
            if (prevState.state !== 'hasData') {
                // もし prevState を await すると、この atom の set の戻り値が Promise<void> になる。その場合は Promise<void> をawait する必要がありそう(深い論考や検証はしていないので、しなくてもいい可能性もある)だがそれは Flocon では不便なので、戻り値を Promise<void> ではなく void にするために何もせずに return している。当然ながらこの場合は set を実行しても何も起こらないという問題点があるが、Flocon のコンポーネントでは set が実行される前に get を useAtomValue などを用いてどこかで事前に実行しておりここには来ないと思われるのと、もしここに来ても致命的な事態にはならないと考えられるため問題ないと判断している。
                loggerRef.warn('set action is ignored at atomWithDebounceStorage.');
                return;
            }
            const newState = atomSet(prevState.data, ...args);
            set(baseAtom, Option.some(newState));
            const saveRequest = async () => {
                await setItemToStorage(newState);
            };
            saveRequestSubject.next(saveRequest);
        },
    );
};
