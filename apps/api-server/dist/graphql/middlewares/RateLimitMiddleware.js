'use strict';

var utils$1 = require('@flocon-trpg/utils');
var consume = require('../../rateLimit/consume.js');
var utils = require('../resolvers/utils/utils.js');

const RateLimitMiddleware = (consume$1) => async ({ context }, next) => {
    const decodedIdToken = utils.checkSignIn(context);
    if (decodedIdToken === utils.NotSignIn) {
        utils$1.loggerRef.warn(`RateLimitMiddlewareにおいて、decondedIdTokenが見つかりませんでした。RateLimitMiddlewareが@Authorizedとともに使われていることを確認してください。`);
        return await next();
    }
    const error = await consume.consume(context.rateLimiter, decodedIdToken.uid, consume$1);
    if (error != null) {
        throw new Error(error.errorMessage);
    }
    return await next();
};

exports.RateLimitMiddleware = RateLimitMiddleware;
//# sourceMappingURL=RateLimitMiddleware.js.map
