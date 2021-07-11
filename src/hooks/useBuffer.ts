import React from 'react';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import useConstant from 'use-constant';
import { useReadonlyRef } from './useReadonlyRef';

export function useBuffer<TValue, TComponent>({
    value,
    bufferDuration,
    onChangeOutput,
    setValueToComponent,
}: {
    value: TValue;
    bufferDuration: number | null;
    onChangeOutput: (params: { previousValue: TValue; currentValue: TValue }) => void;
    setValueToComponent: (params: { value: TValue; component: TComponent }) => void;
}) {
    if (bufferDuration != null && bufferDuration < 0) {
        throw new Error('bufferDuration < 0');
    }

    const onChangeRef = useReadonlyRef(onChangeOutput);
    const setValueToComponentRef = useReadonlyRef(setValueToComponent);

    const ref = React.useRef<TComponent | null>(null);
    const subject = useConstant(() => new Subject<TValue>());
    const subjectNext: ((value: TValue) => void) = useConstant(() => {
        // もし return subect.next としてしまうとsubject.next内でthisがundefinedであるというエラーが出る
        return (x => subject.next(x));
    });
    const [, setSubscription] = React.useState<Subscription>();
    const [changeParams, setChangeParams] = React.useState<{ previousValue?: TValue; currentValue: TValue }>({ currentValue: value });
    const [subscriptionUpdateKey, setSubscriptionUpdateKey] = React.useState(0);

    React.useEffect(() => {
        if (ref.current != null) {
            setValueToComponentRef.current({ value, component: ref.current });
        }

        setSubscriptionUpdateKey(oldState => oldState + 1);
        setChangeParams({ currentValue: value });
    }, [setValueToComponentRef, value]);

    React.useEffect(() => {
        const newSubscription = (bufferDuration == null ? subject : subject.pipe(debounceTime(bufferDuration))).subscribe(newValue => {
            setChangeParams(oldResult => {
                return {
                    previousValue: oldResult.currentValue,
                    currentValue: newValue,
                };
            });
        });
        setSubscription(oldSubscription => {
            oldSubscription?.unsubscribe();
            return newSubscription;
        });
        return (() => {
            newSubscription.unsubscribe();
        });
    }, [subject, bufferDuration, subscriptionUpdateKey]);

    React.useEffect(() => {
        if (changeParams.previousValue !== undefined) {
            onChangeRef.current({
                previousValue: changeParams.previousValue,
                currentValue: changeParams.currentValue,
            });
        }
    }, [changeParams, onChangeRef]);

    return {
        onChangeInput: subjectNext,
        ref,
    };
}