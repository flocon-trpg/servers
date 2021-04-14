"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupJoin = exports.CustomDualKeyMap = void 0;
const DualKeyMap_1 = require("./DualKeyMap");
const $DualKeyMap = __importStar(require("./DualKeyMap"));
class CustomDualKeyMap {
    constructor(params) {
        this.params = params;
        if (params.sourceMap instanceof DualKeyMap_1.DualKeyMap) {
            this._dualKeyMap = params.sourceMap.clone();
            return;
        }
        this._dualKeyMap = new DualKeyMap_1.DualKeyMap(params.sourceMap);
    }
    get dualKeyMap() {
        return this._dualKeyMap;
    }
    wrap(dualKeyMap) {
        const result = new CustomDualKeyMap(Object.assign(Object.assign({}, this.params), { sourceMap: undefined }));
        result._dualKeyMap = dualKeyMap;
        return result;
    }
    createKey(source) {
        return this.params.createKey(source);
    }
    createDualKey(source) {
        return this.params.createDualKey(source);
    }
    map(mapping) {
        const result = new CustomDualKeyMap(Object.assign(Object.assign({}, this.params), { sourceMap: undefined }));
        result._dualKeyMap = this._dualKeyMap.map(mapping);
        return result;
    }
    clone() {
        const result = new CustomDualKeyMap(Object.assign(Object.assign({}, this.params), { sourceMap: undefined }));
        result._dualKeyMap = this._dualKeyMap.clone();
        return result;
    }
    get(key) {
        const dualKey = this.params.createDualKey(key);
        return this._dualKeyMap.get(dualKey);
    }
    getByFirst(first) {
        return this._dualKeyMap.getByFirst(first);
    }
    set(key, value) {
        const dualKey = this.params.createDualKey(key);
        this._dualKeyMap.set(dualKey, value);
        return this;
    }
    delete(key) {
        const dualKey = this.params.createDualKey(key);
        return this._dualKeyMap.delete(dualKey);
    }
    has(key) {
        const dualKey = this.params.createDualKey(key);
        return this._dualKeyMap.has(dualKey);
    }
    *[Symbol.iterator]() {
        for (const [dualKey, value] of this._dualKeyMap) {
            yield [this.params.createKey(dualKey), value];
        }
    }
    toArray() {
        return [...this];
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
    toJSON() {
        return this._dualKeyMap.toJSON();
    }
}
exports.CustomDualKeyMap = CustomDualKeyMap;
const groupJoin = (left, right) => {
    const result = $DualKeyMap.groupJoin(left.dualKeyMap, right.dualKeyMap);
    return new CustomDualKeyMap(Object.assign(Object.assign({}, left), { sourceMap: result }));
};
exports.groupJoin = groupJoin;
