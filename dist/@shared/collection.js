"use strict";
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.range = exports.__ = void 0;
const Set_1 = require("./Set");
const Types_1 = require("./Types");
const errorMessages = {
    indexOutOfRange: 'index out of range',
    notInteger: 'not integer',
};
class $Iterator {
    constructor(iterate) {
        this.iterate = iterate;
    }
    toAsync(iterateSync) {
        function iterate() {
            return __asyncGenerator(this, arguments, function* iterate_1() {
                for (const elem of iterateSync()) {
                    yield yield __await(elem);
                }
            });
        }
        return new $AsyncIterator(iterate);
    }
    compact(mapping) {
        return this.flatMap((elem, index) => {
            const result = mapping(elem, index);
            if (result == null) {
                return [];
            }
            return [result];
        });
    }
    compactAsync(mapping) {
        return this.toAsync(this.iterate).compactAsync(mapping);
    }
    count() {
        let result = 0;
        for (const _ of this.iterate()) {
            result++;
        }
        return result;
    }
    some(predicate) {
        return this.find(predicate) !== undefined;
    }
    filter(predicate) {
        const baseIterate = this.iterate;
        function* iterate() {
            let index = 0;
            for (const elem of baseIterate()) {
                if (predicate(elem, index)) {
                    yield elem;
                }
                index++;
            }
        }
        return new $Iterator(iterate);
    }
    find(predicate) {
        let index = 0;
        for (const elem of this.iterate()) {
            if (predicate(elem, index)) {
                return { index, value: elem };
            }
            index++;
        }
        return undefined;
    }
    flatMap(mapping) {
        const baseIterate = this.iterate;
        function* iterate() {
            let index = 0;
            for (const elem of baseIterate()) {
                yield* mapping(elem, index);
                index++;
            }
        }
        return new $Iterator(iterate);
    }
    forEach(action) {
        for (const elem of this.iterate()) {
            action(elem);
        }
    }
    map(mapping) {
        const baseIterate = this.iterate;
        function* iterate() {
            let index = 0;
            for (const elem of baseIterate()) {
                yield mapping(elem, index);
                index++;
            }
        }
        return new $Iterator(iterate);
    }
    mapAsync(mapping) {
        return this.toAsync(this.iterate).mapAsync(mapping);
    }
    reduce(mapping, seed) {
        let result = seed;
        let index = 0;
        for (const elem of this.iterate()) {
            result = mapping(result, elem, index);
            index++;
        }
        return result;
    }
    reduceAsync(mapping, seed) {
        return this.toAsync(this.iterate).reduceAsync(mapping, seed);
    }
    skipAndTake(skipCount, thenTakeCount) {
        const baseIterate = this.iterate;
        function* iterate() {
            let index = 0;
            for (const elem of baseIterate()) {
                if (skipCount <= index) {
                    if (thenTakeCount == null || index < (skipCount + thenTakeCount)) {
                        yield elem;
                    }
                }
                index++;
            }
        }
        return new $Iterator(iterate);
    }
    skip(count) {
        return this.skipAndTake(count, undefined);
    }
    take(count) {
        return this.skipAndTake(0, count);
    }
    toArray() {
        return [...this.iterate()];
    }
    toMap(mapping) {
        const result = new Map();
        for (const elem of this.iterate()) {
            const { key, value } = mapping(elem);
            result.set(key, value);
        }
        return result;
    }
    toMapAsync(mapping) {
        return this.toAsync(this.iterate).toMapAsync(mapping);
    }
}
class $AsyncIterator {
    constructor(iterateAsync) {
        this.iterateAsync = iterateAsync;
    }
    compactAsync(mapping) {
        const baseIterate = this.iterateAsync;
        function iterateAsync() {
            return __asyncGenerator(this, arguments, function* iterateAsync_1() {
                var e_1, _a;
                let index = 0;
                try {
                    for (var _b = __asyncValues(baseIterate()), _c; _c = yield __await(_b.next()), !_c.done;) {
                        const elem = _c.value;
                        const value = yield __await(mapping(elem, index));
                        if (value == null) {
                            continue;
                        }
                        yield yield __await(value);
                        index++;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield __await(_a.call(_b));
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            });
        }
        return new $AsyncIterator(iterateAsync);
    }
    mapAsync(mapping) {
        const baseIterate = this.iterateAsync;
        function iterate() {
            return __asyncGenerator(this, arguments, function* iterate_2() {
                var e_2, _a;
                let index = 0;
                try {
                    for (var _b = __asyncValues(baseIterate()), _c; _c = yield __await(_b.next()), !_c.done;) {
                        const elem = _c.value;
                        yield yield __await(yield __await(mapping(elem, index)));
                        index++;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield __await(_a.call(_b));
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            });
        }
        return new $AsyncIterator(iterate);
    }
    async reduceAsync(mapping, seed) {
        var e_3, _a;
        let result = seed;
        let index = 0;
        try {
            for (var _b = __asyncValues(this.iterateAsync()), _c; _c = await _b.next(), !_c.done;) {
                const elem = _c.value;
                result = await mapping(result, elem, index);
                index++;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return result;
    }
    async toArrayAsync() {
        var e_4, _a;
        const result = [];
        try {
            for (var _b = __asyncValues(this.iterateAsync()), _c; _c = await _b.next(), !_c.done;) {
                const x = _c.value;
                result.push(x);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return result;
    }
    async toMapAsync(mapping) {
        var e_5, _a;
        const result = new Map();
        try {
            for (var _b = __asyncValues(this.iterateAsync()), _c; _c = await _b.next(), !_c.done;) {
                const elem = _c.value;
                const { key, value } = await mapping(elem);
                result.set(key, value);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return result;
    }
}
class $ReadonlyArray extends $Iterator {
    constructor(source) {
        super(() => source.values());
        this.source = source;
    }
    count() {
        return this.source.length;
    }
    elementAt(index) {
        if (!Number.isInteger(index)) {
            throw errorMessages.notInteger;
        }
        if (index < this.source.length) {
            return this.source[index];
        }
        throw errorMessages.indexOutOfRange;
    }
    elementAtOrDefault(index, defaultValue) {
        if (!Number.isInteger(index)) {
            throw errorMessages.notInteger;
        }
        if (index < this.source.length) {
            return this.source[index];
        }
        return defaultValue;
    }
    elementAtOrUndefined(index) {
        return this.elementAtOrDefault(index, undefined);
    }
    async findOrUndefinedAsync(predicateAsync) {
        for (const element of this.source) {
            if (await predicateAsync(element)) {
                return element;
            }
        }
        return undefined;
    }
    first() {
        if (this.source.length === 0) {
            throw 'array is empty.';
        }
        return this.source[0];
    }
    firstOrDefault(defaultValue) {
        if (this.source.length === 0) {
            return defaultValue;
        }
        return this.source[0];
    }
    last() {
        if (this.source.length === 0) {
            throw 'array is empty.';
        }
        return this.source[this.source.length - 1];
    }
    lastOrDefault(defaultValue) {
        if (this.source.length === 0) {
            return defaultValue;
        }
        return this.source[this.source.length - 1];
    }
    single() {
        if (this.source.length !== 1) {
            throw 'array.length !== 1';
        }
        return this.source[0];
    }
    get value() {
        return this.source;
    }
}
class $ReadonlySet extends $Iterator {
    constructor(source) {
        super(() => source.values());
        this.source = source;
    }
    count() {
        return this.source.size;
    }
    groupJoin(right) {
        const rightSource = right instanceof $ReadonlySet ? right.source : right;
        return Set_1.groupJoin(this.source, rightSource);
    }
    equal(another) {
        for (const [, value] of this.groupJoin(another)) {
            if (value !== Types_1.both) {
                return false;
            }
        }
        return true;
    }
    single() {
        if (this.source.size !== 1) {
            throw 'array.size !== 1';
        }
        return [...this.source][0];
    }
    get value() {
        return this.source;
    }
}
class $ReadonlyMap extends $Iterator {
    constructor(source) {
        super(() => [...source].values());
        this.source = source;
    }
    mapToArray(mapping) {
        const result = [];
        this.source.forEach((value, key) => {
            result.push(mapping({ key, value }));
        });
        return result;
    }
    forAll(predicate) {
        for (const [key, value] of this.source) {
            if (!predicate({ key, value })) {
                return false;
            }
        }
        return true;
    }
}
function __(source) {
    if (source instanceof $ReadonlyArray) {
        return source;
    }
    if (source instanceof $ReadonlyMap) {
        return source;
    }
    if (source instanceof $ReadonlySet) {
        return source;
    }
    if (source instanceof $Iterator) {
        return source;
    }
    if ('get' in source) {
        return new $ReadonlyMap(source);
    }
    if ('size' in source) {
        return new $ReadonlySet(source);
    }
    if ('length' in source) {
        return new $ReadonlyArray(source);
    }
    return new $Iterator(() => source[Symbol.iterator]());
}
exports.__ = __;
function range(from, count) {
    function* iterate() {
        for (let i = 0; i < count; i++) {
            yield from + i;
        }
    }
    return new $Iterator(iterate);
}
exports.range = range;
