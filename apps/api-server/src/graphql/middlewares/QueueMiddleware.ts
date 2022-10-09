import { MiddlewareFn } from 'type-graphql';
import { ResolverContext } from '../../types';
import { queueLimitReached, timeout } from '../../utils/promiseQueue';
const timeoutMs = 10000;

// TODO: エラーが発生したときはログを記録する。
export const QueueMiddleware: MiddlewareFn<ResolverContext> = async ({ context }, next) => {
    const result = await context.promiseQueue.nextWithTimeout(() => next(), timeoutMs);
    switch (result.type) {
        case queueLimitReached:
            throw new Error(
                'PromiseQueue rejected your operation. Server is too busy or there is a bug. / リクエストされた処理は拒否されました。サーバーに負荷がかかっているか、ソースコードにバグがあります。'
            );
        case timeout:
            throw new Error(
                'PromiseQueue timeout. Requested operation is too heavy or there is a bug. / リクエストされた処理がタイムアウトしました。処理が非常に重いか、ソースコードにバグがあります。'
            );
    }
    return result.value;
};
