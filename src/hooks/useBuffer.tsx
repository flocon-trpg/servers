import React from 'react';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import useConstant from 'use-constant';

export function useBuffer<TValue, TComponent>({
    value,
    bufferDuration,
    onChangeOutput,
    equal,
    setValueToComponent,
}: {
    value: TValue;
    bufferDuration: number | null;
    onChangeOutput: (params: { previousValue: TValue; currentValue: TValue }) => void;
    equal: (params: { value: TValue; component: TComponent }) => boolean;
    setValueToComponent: (params: { value: TValue; component: TComponent }) => void;
}) {
    if (bufferDuration != null && bufferDuration < 0) {
        throw 'bufferDuration < 0';
    }

    const onChangeRef = React.useRef(onChangeOutput);
    React.useEffect(() => {
        onChangeRef.current = onChangeOutput;
    }, [onChangeOutput]);

    const equalRef = React.useRef(equal);
    React.useEffect(() => {
        equalRef.current = equal;
    }, [equal]);

    const setValueToComponentRef = React.useRef(setValueToComponent);
    React.useEffect(() => {
        setValueToComponentRef.current = setValueToComponent;
    }, [setValueToComponent]);

    const ref = React.useRef<TComponent>(null);
    const subject = useConstant(() => new Subject<TValue>());
    const subjectNext: ((value: TValue) => void) = useConstant(() => subject.next);
    const [, setSubscription] = React.useState<Subscription>();
    const [changeParams, setChangeParams] = React.useState<{ previousValue?: TValue; currentValue: TValue }>({ currentValue: value });

    React.useEffect(() => {
        if (ref.current == null) {
            return;
        }

        if (!equalRef.current({ value, component: ref.current })) {
            // previousValue === undefinedであるためonChangeOutputは呼ばれない。
            setChangeParams({ currentValue: value });
            setValueToComponentRef.current({ value, component: ref.current });
        }
    }, [value]);

    React.useEffect(() => {
        const newSubscription = (bufferDuration == null ? subject : subject.pipe(debounceTime(bufferDuration))).subscribe(newValue => setChangeParams(oldResult => {
            return {
                previousValue: oldResult.currentValue,
                currentValue: newValue,
            };
        }));
        setSubscription(oldSubscription => {
            oldSubscription?.unsubscribe();
            return newSubscription;
        });
        return (() => {
            newSubscription.unsubscribe();
        });
    }, [subject, bufferDuration, value]);

    React.useEffect(() => {
        if (changeParams.previousValue !== undefined) {
            onChangeRef.current({
                previousValue: changeParams.previousValue,
                currentValue: changeParams.currentValue,
            });
        }
    }, [changeParams]);

    return {
        onChangeInput: subjectNext,
        ref,
    };
}