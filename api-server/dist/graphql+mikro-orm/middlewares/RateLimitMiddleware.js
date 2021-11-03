"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const consume_1 = require("../../rateLimit/consume");
const helpers_1 = require("../resolvers/utils/helpers");
const RateLimitMiddleware = (consume) => async ({ context }, next) => {
    const decodedIdToken = (0, helpers_1.checkSignIn)(context);
    if (decodedIdToken === helpers_1.NotSignIn) {
        console.warn(`RateLimitMiddlewareにおいて、decondedIdTokenが見つかりませんでした。RateLimitMiddlewareが@Authorizedとともに使われていることを確認してください。`);
        return await next();
    }
    const error = await (0, consume_1.consume)(context.rateLimiter, decodedIdToken.uid, consume);
    if (error != null) {
        throw new Error(error.errorMessage);
    }
    return await next();
};
exports.RateLimitMiddleware = RateLimitMiddleware;
