'use strict';

var promiseQueue = require('../../utils/promiseQueue.js');

const timeoutMs = 10000;
const QueueMiddleware = async ({ context }, next) => {
    const result = await context.promiseQueue.nextWithTimeout(() => next(), timeoutMs);
    switch (result.type) {
        case promiseQueue.queueLimitReached:
            throw new Error('PromiseQueue rejected your operation. Server is too busy or there is a bug. / リクエストされた処理は拒否されました。サーバーに負荷がかかっているか、ソースコードにバグがあります。');
        case promiseQueue.timeout:
            throw new Error('PromiseQueue timeout. Requested operation is too heavy or there is a bug. / リクエストされた処理がタイムアウトしました。処理が非常に重いか、ソースコードにバグがあります。');
    }
    return result.value;
};

exports.QueueMiddleware = QueueMiddleware;
//# sourceMappingURL=QueueMiddleware.js.map
