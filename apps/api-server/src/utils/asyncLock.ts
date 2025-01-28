import AsyncLock from 'async-lock';

// lock が解放されなかったり、queue がたまって応答不能になると問題なので、オプションに値を設定している。ただし、低スペックのサーバーでもいちおう動くように大きめにとっている。値は調整しても構わない。
const lock = new AsyncLock({ maxExecutionTime: 10_000, timeout: 20_000, maxPending: 100 });

// 当初は全体に async-lock をかけることも考えたが、Middleware 等で async-lock は使えない(Middleware では後続の処理が終わったことを検知できないため)ので Guard 等に async-lock をかけることが仕様上不可能であるため、Room の操作に絞って async-lock をかけることにした。
export const lockByRoomId = async <T>(roomId: string, fn: () => T | PromiseLike<T>) => {
    return await lock.acquire(`Room@${roomId}`, fn);
};
