import React from 'react';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import useConstant from 'use-constant';

type Result<T> = {
    previousValue?: T;
    currentValue: T;
    isSkipping: boolean;
};

export function useBufferValue<T>({
    value,
    bufferDuration,
}: {
    value: T;
    bufferDuration: number | null;
}) {
    if (bufferDuration != null && bufferDuration < 0) {
        throw new Error('bufferDuration < 0');
    }

    const subject = useConstant(() => new Subject<T>());
    const subjectNext: (value: T) => void = useConstant(() => {
        return x => subject.next(x);
    });
    const [, setSubscription] = React.useState<Subscription>();
    const [result, setResult] = React.useState<Result<T>>({
        currentValue: value,
        isSkipping: false,
    });

    React.useEffect(() => {
        const newSubscription = (bufferDuration == null
            ? subject
            : subject.pipe(debounceTime(bufferDuration))
        ).subscribe(newValue => {
            setResult(oldResult => {
                return {
                    previousValue: oldResult.currentValue,
                    currentValue: newValue,
                    isSkipping: false,
                };
            });
        });
        setSubscription(oldSubscription => {
            oldSubscription?.unsubscribe();
            return newSubscription;
        });
        return () => {
            newSubscription.unsubscribe();
        };
    }, [subject, bufferDuration]);

    React.useEffect(() => {
        subjectNext(value);
        setResult(old => ({ ...old, isSkipping: true }));
    }, [value, subjectNext]);

    return result;
}
