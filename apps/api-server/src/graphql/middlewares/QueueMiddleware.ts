import { MiddlewareFn } from 'type-graphql';
import { ResolverContext } from '../../types';
import { queueLimitReached } from '../../utils/promiseQueue';
import { serverTooBusyMessage } from '../resolvers/messages';

export const QueueMiddleware: MiddlewareFn<ResolverContext> = async ({ context }, next) => {
    const result = await context.promiseQueue.next(() => next());
    if (result.type === queueLimitReached) {
        throw new Error(serverTooBusyMessage);
    }
    return result.value;
};
