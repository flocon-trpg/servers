import React from 'react';
import { Subject, Subscription } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import useConstant from 'use-constant';

export type BufferResult<T> = {
    previousValue?: T;
    currentValue: T;
    isReset: boolean;
}

// stateが変わった際、変化が落ち着いてからcurrentValue（とpreviousValue）が更新される。このときのisResetはfalse。
// ただし、resetStateかresetKeyのうち少なくとも一方を変えると即座にcurrentValue（とpreviousValue）を更新でき、currentValueの値はresetStateになる。このときのisResetはtrue。
// resetKeyが定義されている理由は、resetStateの値が前と今で変わらない状況でも更新することを可能にさせるため。
export const useBuffer = <T>(state: T, resetState: T, resetKey: number): BufferResult<T> => {
    const subject = useConstant(() => new Subject<T>());
    const [result, setResult] = React.useState<BufferResult<T>>({ currentValue: state, isReset: false }); // 初期値のisResetは使われないので適当でいい。ここではfalseにしている。
    const [, setSubscription] = React.useState<Subscription>();

    React.useEffect(() => {
        setResult(oldResult => ({
            previousValue: oldResult.currentValue,
            currentValue: resetState,
            isReset: true,
        }));
        const newSubscription = subject.pipe(auditTime(500)).subscribe(newValue => setResult(oldResult => ({
            previousValue: oldResult.currentValue,
            currentValue: newValue,
            isReset: false,
        })));
        setSubscription(oldSubscription => {
            oldSubscription?.unsubscribe();
            return newSubscription;
        });
        return (() => {
            newSubscription.unsubscribe();
        });
    }, [subject, resetState, resetKey]);

    React.useEffect(() => {
        subject.next(state);
    }, [subject, state]);

    return result;
};