import { Observable, Subject } from 'rxjs';
import * as Rx from 'rxjs/operators';
import { defer, of } from 'rxjs';
import { v4 } from 'uuid';
import { EM } from './types';

// promise-queueはtimeoutがなく、またqueueLimitReachedを判定するにはエラーメッセージから求める必要がある。promise-queue-plusが求めているものに近いが、こちらもエラーメッセージからqueueLimitReachedやtimeoutを求める必要があるのと、d.tsファイルが見当たらなかった。そのため自作した。
// ただ、MongoDBを使うのをやめたため、もしかしたら必要ないかもしれない。

export const executed = 'executed';
export const timeout = 'timeout';
export const queueLimitReached = 'queueLimitReached';

type RawResult = {
    id: string;
    result:
        | {
              type: typeof executed;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              value: any; // Promiseが成功したときの型はanyで、失敗したときのreasonの型もanyなので共用させている
              isError: boolean;
          }
        | {
              type: typeof timeout;
          }
        | {
              type: typeof queueLimitReached;
          };
};

type Result<T> =
    | {
          type: typeof executed;
          value: T;
      }
    | {
          type: typeof queueLimitReached;
      };

type ResultWithTimeout<T> =
    | Result<T>
    | {
          type: typeof timeout;
      };

export class PromiseQueue {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly _promises = new Subject<{
        id: string;
        execute: () => Promise<any>;
        timeout: number | null | undefined;
    }>();
    // _resultはerrorやcompleteが流されない仕様にしている。もしerrorが流されてきたら、コンストラクタ内でsubscribeしているところで例外がthrowされる。
    readonly _result: Observable<RawResult>;
    readonly _pendingPromises = new Set<string>(); // 値は_coreのid

    public constructor({ queueLimit }: { queueLimit?: number | null }) {
        this._result = this._promises.pipe(
            Rx.map(({ id, execute, timeout }) => {
                const rawObservable = new Observable<RawResult>(observer => {
                    if (queueLimit != null && queueLimit < this._pendingPromises.size) {
                        this._pendingPromises.delete(id);
                        observer.next({ id, result: { type: queueLimitReached } });
                        observer.complete();
                        return;
                    }

                    execute()
                        .then(result =>
                            observer.next({
                                id,
                                result: { type: executed, value: result, isError: false },
                            })
                        )
                        .catch(reason =>
                            observer.next({
                                id,
                                result: { type: executed, value: reason, isError: true },
                            })
                        )
                        .finally(() => {
                            this._pendingPromises.delete(id);
                            observer.complete();
                        });
                });
                if (timeout == null) {
                    return rawObservable;
                }
                const timeoutValue: RawResult = {
                    id,
                    result: { type: 'timeout' },
                };
                return rawObservable.pipe(
                    Rx.timeoutWith(
                        timeout,
                        defer(() => {
                            this._pendingPromises.delete(id);
                            return of(timeoutValue);
                        })
                    )
                );
            }),
            Rx.concatAll(),
            Rx.publish(),
            Rx.refCount()
        ); // この場合はどちらかというと.refCount()ではなくConnectableObservableを使うのが適切（インスタンス全体を確実にunsubscribeするようなことも可能になる）だと思われるが、少し怠けている。
        this._result.subscribe(
            () => undefined,
            reason => {
                throw reason;
            },
            () => {
                throw new Error('PromiseQueue observable completed for an unknown reason.');
            }
        );
    }

    private nextCore<T>(
        execute: () => Promise<T>,
        timeout: number | null | undefined
    ): Promise<ResultWithTimeout<T>> {
        const id = v4();
        this._pendingPromises.add(id);
        const result = new Promise<ResultWithTimeout<T>>((resolver, reject) => {
            this._result.pipe(Rx.first(x => x.id === id)).subscribe(
                r => {
                    switch (r.result.type) {
                        case executed:
                            if (r.result.isError) {
                                reject(r.result.value);
                                return;
                            }
                            resolver({ type: executed, value: r.result.value });
                            return;
                        case 'timeout':
                            resolver({ type: 'timeout' });
                            return;
                    }
                },
                // これら2つのrejectは保険。もし何らかの理由で_resultにerrorかcompleteが流されていた場合、これらのrejectがないと永遠にresultのPromiseが終わらなくなってしまう。
                // _resultにcompleteはおそらく流されないが、何らかの理由でerrorが流されることはあるかもしれない。そのとき、コンストラクタ内での_result.subscribeでエラーがthrowされるが、これがcatchされて握りつぶされてしまったケースに備えている。
                // publish=>refCountの仕様についての補足: Observableがpublish=>refCountされていて、常にそれをsubscribeしている場合、nextは当然キャッシュされないが、errorやcompleteはキャッシュされる。
                () => reject('PromiseQueue observable has thrown an error for an unknown reason.'),
                () => reject('PromiseQueue observable has completed for an unknown reason.')
            );
        });
        this._promises.next({ id, execute, timeout });
        return result;
    }

    // timeoutは、executeの戻り値のPromiseの実行時間。nextWithTimeoutを呼んでからの時間ではない。
    public nextWithTimeout<T>(
        execute: () => Promise<T>,
        timeout: number
    ): Promise<ResultWithTimeout<T>> {
        return this.nextCore(execute, timeout);
    }

    public async next<T>(execute: () => Promise<T>): Promise<Result<T>> {
        const result = await this.nextCore(execute, undefined);
        if (result.type === timeout) {
            throw new Error('not expected timeout. ObjectId collision?');
        }
        return result;
    }
}
