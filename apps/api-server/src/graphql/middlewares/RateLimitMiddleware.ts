import { loggerRef } from '@flocon-trpg/utils';
import { MiddlewareFn } from 'type-graphql';
import { consume as consumeFunction } from '../../rateLimit/consume';
import { ResolverContext } from '../../types';
import { NotSignIn, checkSignIn } from '../resolvers/utils/utils';

// TODO: エラーが発生したときはログを記録する。
export const RateLimitMiddleware =
    (consume: number): MiddlewareFn<ResolverContext> =>
    async ({ context }, next) => {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            loggerRef.warn(
                `RateLimitMiddlewareにおいて、decondedIdTokenが見つかりませんでした。RateLimitMiddlewareが@Authorizedとともに使われていることを確認してください。`,
            );
            return await next();
        }
        const error = await consumeFunction(context.rateLimiter, decodedIdToken.uid, consume);
        if (error != null) {
            throw new Error(error.errorMessage);
        }
        return await next();
    };
