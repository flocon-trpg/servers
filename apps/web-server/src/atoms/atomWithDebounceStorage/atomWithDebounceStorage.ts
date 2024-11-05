import { loggerRef } from '@flocon-trpg/utils';
import { atom } from 'jotai';
import { atomWithLazy, loadable } from 'jotai/utils';
import { Subject, concatAll, debounceTime, map } from 'rxjs';

/**
 * localForage を用いて自動保存する atom 。AsyncStorage を用いた atomWithStorage との違いは次のとおり。
 * - 短時間で大量に set されても、ストレージへの保存処理は適度に debounce されて実行される。
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
            // 500msという値は適当。あまりに長すぎるとすぐブラウザのタブが閉じられたときに反映されなくなる可能性が高くなることに注意。
            debounceTime(500),
            map(f => f()),
            concatAll(),
        )
        .subscribe();

    // T ではなくこのように { value: T } にしないと ({ value: T } | Promise<{ value: T }>) がどちらの型であるかを instanceof Promise を用いて簡単に判定できない。なぜならば T が Promise である可能性があるため。
    const anAtom = atomWithLazy<{ value: T } | Promise<{ value: T }>>(() =>
        getItemFromStorage().then(value => ({ value })),
    );
    return atom<T | Promise<T>, Args, void>(
        get => {
            const result = get(anAtom);
            if (result instanceof Promise) {
                return result.then(({ value }) => value);
            }
            return result.value;
        },
        (get, set, ...args: Args) => {
            const awaitedEnsureAtom = loadable(anAtom);
            const prevState = get(awaitedEnsureAtom);
            if (prevState.state !== 'hasData') {
                // もし get(anAtom) をそのまま await すると、この atom の set の戻り値が Promise<void> になる。その場合は Promise<void> を await する必要がありそう(深い論考や検証はしていないので、しなくてもいい可能性もある)だがそれは Flocon では不便なので、戻り値を Promise<void> ではなく void にするのが目的で何もせずに return している。当然ながらこの場合は set を実行しても何も起こらないという問題点があるが、Flocon のコンポーネントでは set が実行される前に get を useAtomValue などを用いてどこかで事前に実行しておりここには来ないと思われるのと、もしここに来ても致命的な事態にはならないと考えられるため問題ないと判断している。
                loggerRef.warn('set action is ignored at atomWithDebounceStorage.');
                return;
            }
            const newState = atomSet(prevState.data.value, ...args);
            set(anAtom, { value: newState });
            const saveRequest = async () => {
                await setItemToStorage(newState);
            };
            saveRequestSubject.next(saveRequest);
        },
    );
};
