import { BehaviorEvent } from './behaviorEvent';

/**
 * 現在の値の取得と、値の変更を監視できるクラスです。
 *
 * RxJS の `BehaviorSubject` を read-only にしたものと似たクラスです。ただし、error が流されないという点で異なります。 */
export class ReadonlyBehaviorEvent<T> {
    #source: BehaviorEvent<T>;

    constructor(source: BehaviorEvent<T>) {
        this.#source = source;
    }

    /**
     * 値の変更を購読します。
     *
     * subscribe した瞬間に現在の値が流されます。これは RxJS の `BehaviorSubject` の挙動と合わせるためです。
     */
    subscribe(observer: Parameters<BehaviorEvent<T>['subscribe']>[0]) {
        return this.#source.subscribe(observer);
    }

    getValue() {
        return this.#source.getValue();
    }

    /** `getValue()` の alias です。 */
    get value() {
        return this.#source.value;
    }

    /** RxJS の `Observable` に変換します。 */
    asObservable() {
        return this.#source.asObservable();
    }

    static of<T>(value: T) {
        const source = new BehaviorEvent(value);
        source.complete();
        return new ReadonlyBehaviorEvent(source);
    }
}
