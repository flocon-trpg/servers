import { BehaviorSubject, Observer, Subscription } from 'rxjs';

/** RxJS の `BehaviorSubject` と似たクラスです。ただし、error が流されないという点で異なります。 */
export class BehaviorEvent<T> {
    #source: BehaviorSubject<T>;

    constructor(value: T) {
        this.#source = new BehaviorSubject(value);
    }

    next(value: T) {
        this.#source.next(value);
    }

    complete() {
        this.#source.complete();
    }

    subscribe(observer: Partial<Omit<Observer<T>, 'error'>>): Subscription {
        return this.#source.subscribe(observer);
    }

    getValue() {
        return this.#source.getValue();
    }

    get value() {
        return this.#source.value;
    }

    asObservable() {
        return this.#source.asObservable();
    }

    unsubscribe() {
        return this.#source.unsubscribe();
    }
}
