import { BehaviorEvent } from './behaviorEvent';
/**
 * 現在の値の取得と、値の変更を監視できるクラスです。
 *
 * RxJS の `BehaviorSubject` を read-only にしたものと似たクラスです。ただし、error が流されないという点で異なります。 */
export declare class ReadonlyBehaviorEvent<T> {
    #private;
    constructor(source: BehaviorEvent<T>);
    /**
     * 値の変更を購読します。
     *
     * subscribe した瞬間に現在の値が流されます。これは RxJS の `BehaviorSubject` の挙動と合わせるためです。
     */
    subscribe(observer: Parameters<BehaviorEvent<T>['subscribe']>[0]): import("rxjs").Subscription;
    getValue(): T;
    /** `getValue()` の alias です。 */
    get value(): T;
    /** RxJS の `Observable` に変換します。 */
    asObservable(): import("rxjs").Observable<T>;
    static of<T>(value: T): ReadonlyBehaviorEvent<T>;
}
//# sourceMappingURL=readonlyBehaviorEvent.d.ts.map