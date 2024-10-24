import React from 'react';

// PromiseLike<void> ではなく PromiseLike<unknown> にしているのは、例えばもし PromiseLike<void> にすると f: (arg: T1) => Promise<T2> のような f をそのまま渡して useSingleExecuteAsync1(f) のようにすることができず useSingleExecuteAsync1(arg: T1) => f(arg).then(() => undefined)) のように書く必要があるが、T1 の型が複雑などの理由で書くのが面倒な時があるためそのまま useSingleExecuteAsync1(f) と書けたほうが便利だからである。
type ReturnType = PromiseLike<unknown>;

type AsyncFn1<T> = (param: T) => ReturnType;

type Options = {
    /** async な関数を現在実行中であるため、新たに実行されなかった場合に呼び出されます。 */
    onDecline?: () => void;
};

export const useSingleExecuteAsync1 = <T>(fn: AsyncFn1<T> | undefined, options?: Options) => {
    const [execCounter, setExecCounter] = React.useState(0);
    const execCounterRef = React.useRef(execCounter);
    const optionsRef = React.useRef(options);
    const execute = React.useMemo(
        () => {
            if (fn == null) {
                return undefined;
            }
            const result = (param: T) => {
                if (execCounterRef.current > 0) {
                    optionsRef.current?.onDecline?.();
                    return;
                }
                setExecCounter(counter => counter + 1);
                const result = fn(param);
                void result.then(
                    () => setExecCounter(counter => counter - 1),
                    () => setExecCounter(counter => counter - 1),
                );
            };
            return result;
        },
        // fn を useRef でラップすることで fn を deps から外すことができるが、その場合は fn == null のときに execute を undefined にすることはできない。現在の仕様にしている強い理由はないので、必要であれば変更してもよいと思われる。
        [fn],
    );
    const isExecuting = execCounter > 0;
    return React.useMemo(() => ({ execute, isExecuting }), [execute, isExecuting]);
};

type AsyncFn0 = () => ReturnType;

export const useSingleExecuteAsync0 = (fn: AsyncFn0 | undefined, options?: Options) => {
    const { execute: executeBase, isExecuting } = useSingleExecuteAsync1<undefined>(fn, options);
    const execute = React.useMemo(() => {
        if (executeBase == null) {
            return executeBase;
        }
        return () => executeBase(undefined);
    }, [executeBase]);
    return React.useMemo(() => ({ execute, isExecuting }), [execute, isExecuting]);
};
