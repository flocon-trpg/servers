import React from 'react';

// https://ja.reactjs.org/docs/hooks-reference.html#usememo に「useMemo はパフォーマンス最適化のために使うものであり、意味上の保証があるものだと考えないでください。将来的に React は、例えば画面外のコンポーネント用のメモリを解放するため、などの理由で、メモ化された値を「忘れる」ようにする可能性があります。useMemo なしでも動作するコードを書き、パフォーマンス最適化のために useMemo を加えるようにしましょう。」と書かれている。それに対してこれは値を「忘れない」hook。

export const usePersistentMemo = <T>(factory: () => T, deps: React.DependencyList) => {
    const [result, setResult] = React.useState(factory());
    React.useEffect(() => {
        setResult(factory());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return result;
};
