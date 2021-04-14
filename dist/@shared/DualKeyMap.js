"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupJoin4 = exports.groupJoin3 = exports.groupJoin = exports.DualKeyMap = exports.toJSONString = exports.dualKeyToString = void 0;
const Types_1 = require("./Types");
const dualKeyToString = (source) => {
    return `${source.first}@${source.second}`;
};
exports.dualKeyToString = dualKeyToString;
const toJSONString = (source) => {
    return `{ first: ${source.first}, second: ${source.second} }`;
};
exports.toJSONString = toJSONString;
class DualKeyMap {
    constructor(sourceMap) {
        if (sourceMap != null) {
            this._core = DualKeyMap.mapMap(sourceMap, x => x);
            return;
        }
        this._core = new Map();
    }
    static mapMap(source, mapping) {
        const result = new Map();
        for (const [firstKey, first] of source) {
            if (first.size === 0) {
                continue;
            }
            const toSet = new Map();
            for (const [secondKey, second] of first) {
                toSet.set(secondKey, mapping(second, { first: firstKey, second: secondKey }));
            }
            result.set(firstKey, toSet);
        }
        return result;
    }
    static create(source, mapping) {
        const result = new DualKeyMap();
        result._core = DualKeyMap.mapMap(source instanceof DualKeyMap ? source._core : source, mapping);
        return result;
    }
    map(mapping) {
        return DualKeyMap.create(this, mapping);
    }
    clone() {
        return DualKeyMap.create(this, x => x);
    }
    get({ first, second }) {
        const inner = this._core.get(first);
        if (inner === undefined) {
            return undefined;
        }
        return inner.get(second);
    }
    getByFirst(first) {
        return this._core.get(first);
    }
    set({ first, second }, value) {
        let inner = this._core.get(first);
        if (inner === undefined) {
            inner = new Map();
            this._core.set(first, inner);
        }
        inner.set(second, value);
        return this;
    }
    delete({ first, second }) {
        const inner = this._core.get(first);
        if (inner === undefined) {
            return false;
        }
        const result = inner.delete(second);
        if (inner.size === 0) {
            this._core.delete(first);
        }
        return result;
    }
    has(key) {
        return this.get(key) !== undefined;
    }
    *[Symbol.iterator]() {
        for (const [firstKey, first] of this._core) {
            for (const [secondKey, second] of first) {
                yield [{ first: firstKey, second: secondKey }, second];
            }
        }
    }
    toArray() {
        return [...this];
    }
    toMap() {
        return DualKeyMap.mapMap(this._core, x => x);
    }
    get size() {
        return this.toArray().length;
    }
    get isEmpty() {
        return this.size === 0;
    }
    forEach(action) {
        for (const [key, value] of this) {
            action(value, key);
        }
    }
    reduce(reducer, seed) {
        let result = seed;
        this.forEach((element, key) => result = reducer(result, element, key));
        return result;
    }
    toJSON(valueToString) {
        return JSON.stringify([...this._core]
            .map(([key1, value]) => [key1, [...value].map(([key2, value]) => [key2, valueToString === undefined ? value : valueToString(value)])]));
    }
}
exports.DualKeyMap = DualKeyMap;
const groupJoin = (left, right) => {
    const result = new DualKeyMap();
    const rightClone = right.clone();
    left.forEach((leftElement, key) => {
        const rightElement = rightClone.get(key);
        rightClone.delete(key);
        if (rightElement === undefined) {
            result.set(key, { type: 'left', left: leftElement });
            return;
        }
        result.set(key, { type: 'both', left: leftElement, right: rightElement });
    });
    rightClone.forEach((rightElement, key) => {
        result.set(key, { type: 'right', right: rightElement });
    });
    return result;
};
exports.groupJoin = groupJoin;
const groupJoin3 = (source1, source2, source3) => {
    const source = exports.groupJoin(source1, exports.groupJoin(source2, source3));
    return source.map(group => {
        switch (group.type) {
            case Types_1.left:
                return [group.left, undefined, undefined];
            case Types_1.right:
            case Types_1.both: {
                const result1 = (() => {
                    if (group.type === Types_1.both) {
                        return group.left;
                    }
                    return undefined;
                })();
                switch (group.right.type) {
                    case Types_1.left:
                        return [result1, group.right.left, undefined];
                    case Types_1.right:
                        return [result1, undefined, group.right.right];
                    case Types_1.both:
                        return [result1, group.right.left, group.right.right];
                }
            }
        }
    });
};
exports.groupJoin3 = groupJoin3;
const groupJoin4 = (source1, source2, source3, source4) => {
    const source = exports.groupJoin(exports.groupJoin3(source1, source2, source3), source4);
    return source.map(group => {
        switch (group.type) {
            case Types_1.left:
                return [...group.left, undefined];
            case Types_1.right:
                return [undefined, undefined, undefined, group.right];
            case Types_1.both: {
                return [...group.left, group.right];
            }
        }
    });
};
exports.groupJoin4 = groupJoin4;
