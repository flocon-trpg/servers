import { Observer, Subscription } from 'rxjs';
/** RxJS の `BehaviorSubject` と似たクラスです。ただし、error が流されないという点で異なります。 */
export declare class BehaviorEvent<T> {
    #private;
    constructor(value: T);
    next(value: T): void;
    complete(): void;
    subscribe(observer: Partial<Omit<Observer<T>, 'error'>>): Subscription;
    getValue(): T;
    get value(): T;
    asObservable(): import("rxjs").Observable<T>;
    unsubscribe(): void;
}
//# sourceMappingURL=behaviorEvent.d.ts.map