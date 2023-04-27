/*
This file includes a modified copy of https://github.com/urql-graphql/urql, whose author is Formidable, urql GraphQL Team, and other contributors.
The license of https://github.com/urql-graphql/urql is as follows:


MIT License

Copyright (c) 2018–2020 Formidable,
Copyright (c) urql GraphQL Team and other contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { OperationResult, OperationResultSource } from 'urql';
import { Sink, Source, filter, pipe, subscribe, take, toPromise } from 'wonka';

// Urql の関数の戻り値が OperationResultSource<T> であるため OperationResultSource<T> を作成するための、https://github.com/urql-graphql/urql/blob/9cdb74b03e07d46e056ef023d1543f24a823ec55/packages/core/src/utils/streamUtils.ts を用いた関数。urql の関数をモックする際に用いる。
// 参考: https://github.com/urql-graphql/urql/issues/3133
export function withPromise<T extends OperationResult>(
    _source$: Source<T>
): OperationResultSource<T> {
    const source$ = ((sink: Sink<T>) => _source$(sink)) as OperationResultSource<T>;
    source$.toPromise = () =>
        pipe(
            source$,
            filter(result => !result.stale && !result.hasNext),
            take(1),
            toPromise
        );
    source$.then = (onResolve, onReject) => source$.toPromise().then(onResolve, onReject);
    source$.subscribe = onResult => subscribe(onResult)(source$);
    return source$;
}
