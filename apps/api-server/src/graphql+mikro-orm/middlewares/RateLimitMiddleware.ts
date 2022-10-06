import { MiddlewareFn } from 'type-graphql';
import { ResolverContext } from '../utils/Contexts';
import { consume as consumeFunction } from '../../rateLimit/consume';
import { NotSignIn, checkSignIn } from '../resolvers/utils';

export const RateLimitMiddleware =
    (consume: number): MiddlewareFn<ResolverContext> =>
    async ({ context }, next) => {
        const decodedIdToken = checkSignIn(context);
        if (decodedIdToken === NotSignIn) {
            console.warn(
                `RateLimitMiddlewareにおいて、decondedIdTokenが見つかりませんでした。RateLimitMiddlewareが@Authorizedとともに使われていることを確認してください。`
            );
            return await next();
        }
        const error = await consumeFunction(context.rateLimiter, decodedIdToken.uid, consume);
        if (error != null) {
            throw new Error(error.errorMessage);
        }
        return await next();
    };
