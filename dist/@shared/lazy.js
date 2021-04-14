"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncLazy = exports.lazy = void 0;
class LazyImpl {
    constructor(get) {
        this.get = get;
        this.loaded = false;
    }
    get value() {
        if (this.loaded) {
            return this.cache;
        }
        const cache = this.get();
        this.cache = cache;
        this.loaded = true;
        return cache;
    }
}
class AsyncLazyImpl {
    constructor(getAsync) {
        this.getAsync = getAsync;
        this.loaded = false;
    }
    async getValue() {
        if (this.loaded) {
            return this.cache;
        }
        const cache = await this.getAsync();
        this.cache = cache;
        this.loaded = true;
        return cache;
    }
}
const lazy = (get) => new LazyImpl(get);
exports.lazy = lazy;
const asyncLazy = (getAsync) => new AsyncLazyImpl(getAsync);
exports.asyncLazy = asyncLazy;
