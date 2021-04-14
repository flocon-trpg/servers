"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONObject = void 0;
const collection_1 = require("./collection");
const keysToString = (keys) => {
    if (keys.length === 0) {
        return 'root value';
    }
    let result = keys[0];
    collection_1.__(keys).skip(1).forEach(key => {
        result = `${result}/${key}`;
    });
    return result;
};
class JSONObject {
    constructor(jsonObject, currentPath) {
        this.jsonObject = jsonObject;
        this.currentPath = currentPath;
        if (jsonObject == null) {
            throw 'jsonObject == null';
        }
    }
    static init(jsonRoot) {
        return new JSONObject(jsonRoot, []);
    }
    tryGet(key) {
        if (typeof this.jsonObject !== 'object') {
            return undefined;
        }
        const child = this.jsonObject[key];
        if (child == null) {
            return child;
        }
        return new JSONObject(child, [...this.currentPath, key]);
    }
    get(key) {
        const result = this.tryGet(key);
        if (result == null) {
            throw `${keysToString([...this.currentPath, key])} is not object.`;
        }
        return result;
    }
    valueAsString() {
        if (typeof this.jsonObject === 'string') {
            return this.jsonObject;
        }
        throw `${keysToString(this.currentPath)} must be string.`;
    }
    valueAsNullableString() {
        if (this.jsonObject === null || typeof this.jsonObject === 'string') {
            return this.jsonObject;
        }
        throw `${keysToString(this.currentPath)} must be string or null.`;
    }
    valueAsBoolean() {
        if (typeof this.jsonObject === 'boolean') {
            return this.jsonObject;
        }
        throw `${keysToString(this.currentPath)} must be true or false.`;
    }
}
exports.JSONObject = JSONObject;
