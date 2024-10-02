import { RateLimiterAbstract, RateLimiterRes } from 'rate-limiter-flexible';

const createErrorMessage = (res: RateLimiterRes): string => {
    return `Rate limit exceeded. Please wait for ${res.msBeforeNext / 1000} seconds.`;
};

export const consume = async (
    rateLimiter: RateLimiterAbstract | null,
    userUid: string,
    consume: number,
) => {
    if (rateLimiter == null) {
        return undefined;
    }
    const errorRes = await rateLimiter
        .consume(userUid, consume)
        .then(() => null)
        .catch((res: RateLimiterRes) => res);
    if (errorRes == null) {
        return undefined;
    }
    return { errorMessage: createErrorMessage(errorRes) };
};
