"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consume = void 0;
const createErrorMessage = (res) => {
    return `Rate limit exceeded. Please wait for ${res.msBeforeNext / 1000} seconds.`;
};
const consume = async (rateLimiter, userUid, consume) => {
    if (rateLimiter == null) {
        return undefined;
    }
    const errorRes = await rateLimiter
        .consume(userUid, consume)
        .then(() => null)
        .catch((res) => res);
    if (errorRes == null) {
        return undefined;
    }
    return { errorMessage: createErrorMessage(errorRes) };
};
exports.consume = consume;
